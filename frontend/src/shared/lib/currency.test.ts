import { describe, expect, it } from "vitest";
import { formatBRL } from "@/shared/lib/currency";

describe("formatBRL", () => {
  it("formats integer values", () => {
    const result = formatBRL(1000);
    expect(result).toContain("1.000");
    expect(result).toContain("R$");
  });

  it("formats decimal values", () => {
    const result = formatBRL(19.9);
    expect(result).toContain("19,90");
  });

  it("formats zero", () => {
    const result = formatBRL(0);
    expect(result).toContain("0,00");
  });

  it("formats small values", () => {
    const result = formatBRL(0.01);
    expect(result).toContain("0,01");
  });

  it("formats large values", () => {
    const result = formatBRL(99999.99);
    expect(result).toContain("99.999,99");
  });
});
