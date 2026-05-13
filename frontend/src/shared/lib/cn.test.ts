import { cn } from "@/shared/lib/cn";

describe("cn", () => {
  it("joins multiple class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out false values", () => {
    expect(cn("a", false, "b")).toBe("a b");
  });

  it("filters out null values", () => {
    expect(cn("a", null, "b")).toBe("a b");
  });

  it("filters out undefined values", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });

  it("filters out empty strings", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles single class name", () => {
    expect(cn("solo")).toBe("solo");
  });

  it("handles mixed truthy and falsy values", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("btn", isActive && "btn-active", isDisabled && "btn-disabled")).toBe("btn btn-active");
  });
});
