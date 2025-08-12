"use client";

import { encodeFunctionData, parseAbi } from "viem";
import { sdk } from "@farcaster/miniapp-sdk";

type Eip1193RequestArgs = { method: string; params?: unknown[] | Record<string, unknown> };
type Eip1193Provider = {
  request: <TResponse = unknown>(args: Eip1193RequestArgs) => Promise<TResponse>;
};

const erc20Abi = parseAbi([
  "function approve(address spender, uint256 value) returns (bool)",
]);

const postingFeeAbi = parseAbi([
  "function payForProjectPost()",
  "function payForProfilePost()",
]);

function getInjectedProvider(): Eip1193Provider | null {
  const w = globalThis as unknown as { ethereum?: Eip1193Provider };
  const injected = w?.ethereum;
  const sdkEth = (sdk as unknown as { ethereum?: Eip1193Provider }).ethereum;
  return injected || sdkEth || null;
}

function toHexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

async function ensureChain(provider: Eip1193Provider, chainId: number): Promise<void> {
  if (!Number.isFinite(chainId) || chainId <= 0) return;
  const hex = toHexChainId(chainId);
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
  } catch {
    // ignore if not supported or user rejected; tx may still succeed if already on the right chain
  }
}

async function getFirstAccount(provider: Eip1193Provider): Promise<string> {
  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts?.[0]) throw new Error("wallet account not available");
  return accounts[0];
}

type TransactionReceipt = { status?: string | boolean | null } | null;

async function waitForReceipt(provider: Eip1193Provider, txHash: string, timeoutMs = 60000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const receipt = await provider.request<TransactionReceipt>({ method: "eth_getTransactionReceipt", params: [txHash] });
    if (receipt && receipt.status) return; // any status indicates mined (0x1 success, 0x0 failure)
    await new Promise((r) => setTimeout(r, 1500));
  }
  // timeout is not fatal; caller may proceed
}

export async function payPostingFeeWithFarcasterWallet(params: {
  chainId: number;
  usdc: string; // address
  postingFee: string; // address
  amount: bigint; // smallest units
  action: "project" | "profile";
}): Promise<string> {
  const { chainId, usdc, postingFee, amount, action } = params;
  const provider = getInjectedProvider();
  if (!provider) throw new Error("Farcaster wallet provider not available");

  await ensureChain(provider, chainId);
  const from = await getFirstAccount(provider);

  // 1) Approve USDC spending
  const approveData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [postingFee as `0x${string}` , amount],
  });
  const approveHash: string = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to: usdc, data: approveData, value: "0x0" }],
  });
  await waitForReceipt(provider, approveHash);

  // 2) Call pay function
  const fn = action === "project" ? "payForProjectPost" : "payForProfilePost";
  const payData = encodeFunctionData({ abi: postingFeeAbi, functionName: fn });
  const payHash: string = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to: postingFee, data: payData, value: "0x0" }],
  });
  return payHash;
}


