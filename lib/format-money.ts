import type { Money } from "@/lib/api/types";

/**
 * The one place Money -> display-string conversion happens. Everything
 * that renders a Money value should go through this, not inline
 * `Intl.NumberFormat` calls, so a currency-formatting bug fix or locale
 * change only needs to happen here.
 *
 * SLE (Sierra Leonean Leone) isn't in every browser's ICU currency-display
 * table on older engines, so we fall back to a manual "SLE 1,500" style
 * format if Intl throws for an unrecognized code.
 */
export function formatMoney(money: Money | null | undefined, locale = "en-US") {
  if (!money) return "—";
  const amount = Number(money.amount);
  if (Number.isNaN(amount)) return `${money.currency} ${money.amount}`;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: money.currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${money.currency} ${new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }
}
