/**
 * Human voice-over pricing (single source of truth).
 *
 * Every narrator sets their OWN price per minute.
 * The price the client sees in the human voices library is the FINAL platform price:
 *   final = narrator price + platform commission (30% on top of the narrator price)
 */
export const PLATFORM_COMMISSION_PERCENT = 30;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Final price shown to the client (narrator price + commission). */
export const finalPrice = (narratorPrice: number, commissionPct = PLATFORM_COMMISSION_PERCENT) =>
  round2(narratorPrice * (1 + commissionPct / 100));

/** Platform commission amount contained in a narrator price. */
export const commissionAmount = (narratorPrice: number, commissionPct = PLATFORM_COMMISSION_PERCENT) =>
  round2(narratorPrice * (commissionPct / 100));

/** Narrator share contained inside a final (client-facing) price. */
export const narratorShareOf = (finalPriceUsd: number, commissionPct = PLATFORM_COMMISSION_PERCENT) =>
  round2(finalPriceUsd / (1 + commissionPct / 100));

/** "45.5" / "52" — no trailing zeros, Latin digits. */
export const fmtUsd = (n: number) => {
  const r = round2(n);
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, '');
};

/** "$45.5 / دقيقة" */
export const finalPricePerMinuteLabel = (narratorPrice: number) => `$${fmtUsd(finalPrice(narratorPrice))} / دقيقة`;
