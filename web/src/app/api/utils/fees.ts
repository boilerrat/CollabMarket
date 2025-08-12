import { prisma } from "@/server/db";
import { isFeeContractConfigured, readFeeConfig, verifyPostingFeePayment } from "@/server/chain";

export async function getFeeConfig() {
  if (!isFeeContractConfigured()) return { enabled: false, price: null, contract: null, token: null, chainId: null };
  const cfg = await readFeeConfig();
  return { enabled: cfg.feesEnabled, price: cfg.postPrice, contract: cfg.postingFeeContract, token: cfg.usdcContract, chainId: cfg.chainId };
}

export async function assertPaymentNotUsed(txHash: string): Promise<void> {
  const existing = await prisma.payment.findUnique({ where: { txHash } });
  if (existing) throw new Error("payment already used");
}

export async function verifyAndRecordPayment(params: { txHash: string; expectedAction: "project" | "profile"; userId?: string }) {
  const { txHash, expectedAction, userId } = params;
  await assertPaymentNotUsed(txHash);
  const verified = await verifyPostingFeePayment({ txHash, expectedAction });
  await prisma.payment.create({
    data: {
      txHash: verified.txHash,
      action: verified.action,
      payerAddress: verified.payerAddress,
      amount: verified.amount,
      blockNumber: verified.blockNumber,
      blockTime: verified.blockTime,
      userId: userId || null,
    },
  });
  return verified;
}


