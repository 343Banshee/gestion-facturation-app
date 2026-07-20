export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatMoney(cents: number, lang: "FR" | "EN" = "FR"): string {
  const locale = lang === "FR" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(fromCents(cents));
}

/**
 * Same formatting, but with narrow/no-break spaces normalized to a plain space.
 * @react-pdf/renderer's built-in Helvetica only supports WinAnsiEncoding, which
 * doesn't include the U+202F narrow no-break space Intl uses for fr-FR grouping —
 * without this it renders as a garbled glyph in generated PDFs.
 */
export function formatMoneyForPdf(cents: number, lang: "FR" | "EN" = "FR"): string {
  return formatMoney(cents, lang).replace(/[  ]/g, " ");
}
