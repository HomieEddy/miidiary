import { cn } from "@/utils/cn";

describe("cn", () => {
  it("merges simple class strings", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("resolves conflicting Tailwind classes (last wins)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles conditional false values", () => {
    expect(cn("base", false && "hidden")).toBe("base");
  });

  it("ignores undefined and null inputs", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
