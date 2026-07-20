import { describe, it, expect } from "vitest";
import { calculateUrssafAmounts } from "./calculator";

describe("calculateUrssafAmounts", () => {
  it("computes cotisations from a basis-points rate", () => {
    // 2 000,00 € encaissés, taux BIC services 21,20%
    const result = calculateUrssafAmounts(200000, 2120, false, null);
    expect(result.cotisationsCents).toBe(42400);
    expect(result.versementLiberatoireCents).toBe(0);
    expect(result.totalACharge).toBe(42400);
  });

  it("adds versement libératoire when enabled", () => {
    const result = calculateUrssafAmounts(200000, 2120, true, 170);
    expect(result.cotisationsCents).toBe(42400);
    expect(result.versementLiberatoireCents).toBe(3400);
    expect(result.totalACharge).toBe(45800);
  });

  it("ignores the versement libératoire rate when disabled", () => {
    const result = calculateUrssafAmounts(200000, 2120, false, 170);
    expect(result.versementLiberatoireCents).toBe(0);
  });

  it("treats a null versement libératoire rate as zero when enabled", () => {
    const result = calculateUrssafAmounts(200000, 2120, true, null);
    expect(result.versementLiberatoireCents).toBe(0);
  });

  it("returns zero for zero encaissements", () => {
    const result = calculateUrssafAmounts(0, 2120, true, 170);
    expect(result.totalACharge).toBe(0);
  });
});
