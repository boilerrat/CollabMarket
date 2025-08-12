import { createPublicClient, http, type Address, type Hash, parseAbi, decodeEventLog, getAddress, type Chain, type PublicClient } from "viem";

// Environment configuration
const RPC_URL = process.env.CHAIN_RPC_URL || "";
const CHAIN_ID = Number(process.env.CHAIN_ID || 84532); // default to Base Sepolia if unset
const POSTING_FEE_CONTRACT = (process.env.POSTING_FEE_CONTRACT || "").toLowerCase();
const USDC_CONTRACT = (process.env.USDC_CONTRACT || "").toLowerCase();

// Avoid throwing during build: do not construct a client until used

// Minimal chain object to satisfy typing without bringing a full network preset
const minimalChain: Chain = {
  id: CHAIN_ID,
  name: `custom-${CHAIN_ID}`,
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL || "http://localhost"] }, public: { http: [RPC_URL || "http://localhost"] } },
};

function getPublicClient(): PublicClient {
  if (!RPC_URL) {
    throw new Error("CHAIN_RPC_URL not configured");
  }
  return createPublicClient({ transport: http(RPC_URL), chain: minimalChain });
}

// ABI for PostingFee contract (subset required for verification)
export const postingFeeAbi = parseAbi([
  "event FeePaid(address indexed payer, string action, uint256 amount)",
  "event FeesWithdrawn(address indexed to, uint256 amount)",
  "function postPrice() view returns (uint256)",
  "function feesEnabled() view returns (bool)",
  "function usdc() view returns (address)",
]);

export type PostingAction = "project" | "profile";

export type VerifiedPayment = {
  txHash: Hash;
  payerAddress: Address;
  action: PostingAction;
  amount: bigint;
  blockNumber: bigint;
  blockTime: Date;
};

export async function areFeesEnabled(): Promise<boolean> {
  if (!POSTING_FEE_CONTRACT || !RPC_URL) return false;
  try {
    const enabled = await getPublicClient().readContract({
      address: POSTING_FEE_CONTRACT as Address,
      abi: postingFeeAbi,
      functionName: "feesEnabled",
    });
    return Boolean(enabled);
  } catch {
    return false;
  }
}

export async function readFeeConfig(): Promise<{ postPrice: bigint | null; feesEnabled: boolean; postingFeeContract: string; usdcContract: string; chainId: number }>{
  let postPrice: bigint | null = null;
  let enabled = false;
  if (POSTING_FEE_CONTRACT && RPC_URL) {
    try {
      const [price, isEnabled] = await Promise.all([
        getPublicClient().readContract({ address: POSTING_FEE_CONTRACT as Address, abi: postingFeeAbi, functionName: "postPrice" }),
        getPublicClient().readContract({ address: POSTING_FEE_CONTRACT as Address, abi: postingFeeAbi, functionName: "feesEnabled" }),
      ]);
      postPrice = BigInt(price as unknown as string);
      enabled = Boolean(isEnabled);
    } catch {}
  }
  return { postPrice, feesEnabled: enabled, postingFeeContract: POSTING_FEE_CONTRACT, usdcContract: USDC_CONTRACT, chainId: CHAIN_ID };
}

export async function verifyPostingFeePayment(params: { txHash: string; expectedAction: PostingAction }): Promise<VerifiedPayment> {
  if (!POSTING_FEE_CONTRACT) throw new Error("fee contract not configured");
  if (!RPC_URL) throw new Error("rpc not configured");
  const txHash = params.txHash as Hash;
  const expectedAction = params.expectedAction;

  const client = getPublicClient();
  const receipt = await client.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") throw new Error("transaction not successful");

  // Find FeePaid event in logs for the configured contract
  const feeLog = receipt.logs.find((log) => log.address.toLowerCase() === POSTING_FEE_CONTRACT);
  if (!feeLog) throw new Error("fee event not found");

  let decoded: { payer: Address; action: string; amount: bigint };
  try {
    const { args } = decodeEventLog({ abi: postingFeeAbi, data: feeLog.data, topics: feeLog.topics });
    decoded = args as unknown as { payer: Address; action: string; amount: bigint };
  } catch {
    throw new Error("invalid fee event");
  }

  const payer = getAddress(decoded.payer);
  const action = decoded.action;
  if (action !== expectedAction) throw new Error("payment action mismatch");
  if (!decoded.amount || decoded.amount <= BigInt(0)) throw new Error("invalid payment amount");

  // Optional: verify the contract is configured with expected USDC address
  if (USDC_CONTRACT) {
    try {
      const usdc = await client.readContract({ address: POSTING_FEE_CONTRACT as Address, abi: postingFeeAbi, functionName: "usdc" });
      if ((usdc as Address).toLowerCase() !== USDC_CONTRACT) throw new Error("unexpected USDC token");
    } catch (e) {
      throw new Error("failed to validate token");
    }
  }

  const block = await client.getBlock({ blockNumber: receipt.blockNumber });
  const blockTime = new Date(Number(block.timestamp) * 1000);

  return {
    txHash,
    payerAddress: payer,
    action: expectedAction,
    amount: decoded.amount,
    blockNumber: receipt.blockNumber!,
    blockTime,
  };
}

export function isFeeContractConfigured(): boolean {
  return Boolean(POSTING_FEE_CONTRACT);
}


