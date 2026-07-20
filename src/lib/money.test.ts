import { describe, it, expect } from "vitest";
import { toCents, fromCents, formatMoney, formatMoneyForPdf } from "./money";

describe("toCents / fromCents", () => {
  it("converts euros to cents without floating point drift", () => {
    expect(toCents(19.9)).toBe(1990);
    expect(toCents(0.1)).toBe(10);
    expect(toCents(1500)).toBe(150000);
  });

  it("round-trips through fromCents", () => {
    expect(fromCents(toCents(42.5))).toBe(42.5);
  });

  it("rounds to the nearest cent", () => {
    expect(toCents(19.005)).toBe(1901);
  });
});

describe("formatMoney", () => {
  it("formats FR amounts with a comma decimal separator", () => {
    expect(formatMoney(150000, "FR")).toContain("1");
    expect(formatMoney(150000, "FR")).toContain(",00");
  });

  it("formats EN amounts with a dot decimal separator", () => {
    expect(formatMoney(150000, "EN")).toContain(".00");
  });
});

describe("formatMoneyForPdf", () => {
  it("never contains narrow/no-break spaces that break react-pdf's Helvetica", () => {
    const formatted = formatMoneyForPdf(150000, "FR");
    expect(formatted).not.toMatch(/[  ]/);
    expect(formatted).toBe("1 500,00 €");
  });
});
