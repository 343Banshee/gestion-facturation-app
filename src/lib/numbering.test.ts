import { describe, it, expect } from "vitest";
import { formatDocumentNumber } from "./numbering";

describe("formatDocumentNumber", () => {
  it("pads the sequence to 4 digits", () => {
    expect(formatDocumentNumber("FAC", 2026, 1)).toBe("FAC-2026-0001");
    expect(formatDocumentNumber("FAC", 2026, 42)).toBe("FAC-2026-0042");
  });

  it("does not truncate sequences beyond 4 digits", () => {
    expect(formatDocumentNumber("FAC", 2026, 12345)).toBe("FAC-2026-12345");
  });

  it("uses the given prefix and year verbatim", () => {
    expect(formatDocumentNumber("DEV", 2027, 7)).toBe("DEV-2027-0007");
  });
});
