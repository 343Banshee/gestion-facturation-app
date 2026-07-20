import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import { getPeriodBounds, shiftPeriod, formatPeriodLabel } from "./period";

// Period boundaries are intentionally local-time (Europe/Paris), so we compare
// with date-fns `format` (local fields) rather than `toISOString` (UTC) —
// the latter would shift the date backwards for any positive UTC offset.
function d(date: Date) {
  return format(date, "yyyy-MM-dd");
}

describe("getPeriodBounds", () => {
  it("returns calendar month bounds for MONTHLY periodicity", () => {
    const { start, end } = getPeriodBounds("MONTHLY", new Date(2026, 6, 20));
    expect(d(start)).toBe("2026-07-01");
    expect(d(end)).toBe("2026-08-01");
  });

  it("returns calendar quarter bounds for QUARTERLY periodicity", () => {
    const { start, end } = getPeriodBounds("QUARTERLY", new Date(2026, 6, 20));
    expect(d(start)).toBe("2026-07-01");
    expect(d(end)).toBe("2026-10-01");
  });

  it("handles a quarter spanning a year boundary", () => {
    const { start, end } = getPeriodBounds("QUARTERLY", new Date(2025, 11, 15));
    expect(d(start)).toBe("2025-10-01");
    expect(d(end)).toBe("2026-01-01");
  });
});

describe("shiftPeriod", () => {
  it("moves forward and backward by one month", () => {
    const ref = new Date(2026, 6, 1);
    expect(d(shiftPeriod("MONTHLY", ref, 1))).toBe("2026-08-01");
    expect(d(shiftPeriod("MONTHLY", ref, -1))).toBe("2026-06-01");
  });

  it("moves forward and backward by one quarter", () => {
    const ref = new Date(2026, 6, 1);
    expect(d(shiftPeriod("QUARTERLY", ref, 1))).toBe("2026-10-01");
    expect(d(shiftPeriod("QUARTERLY", ref, -1))).toBe("2026-04-01");
  });
});

describe("formatPeriodLabel", () => {
  it("labels quarters as Tn yyyy", () => {
    expect(formatPeriodLabel("QUARTERLY", new Date(2026, 6, 1))).toBe("T3 2026");
    expect(formatPeriodLabel("QUARTERLY", new Date(2026, 0, 1))).toBe("T1 2026");
  });
});
