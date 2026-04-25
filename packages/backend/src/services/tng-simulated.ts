/**
 * Simulated TNG PayLater — always succeeds for hackathon demo.
 *
 * In production, this becomes a real client wrapping the TNG eWallet
 * PayLater API. The shape returned here intentionally mirrors what the
 * real client would expose, so the swap is one file.
 */

export type ApprovalResult = {
  approved: true;
  reference: string;
};

export async function simulateApproval(opts: {
  userId: string;
  amountCents: number;
}): Promise<ApprovalResult> {
  // Tiny delay to mimic network call (helps demo pacing too)
  await new Promise((resolve) => setTimeout(resolve, 50));
  return {
    approved: true,
    reference: `SIM-PL-${opts.userId.slice(0, 6)}-${Date.now()}`,
  };
}
