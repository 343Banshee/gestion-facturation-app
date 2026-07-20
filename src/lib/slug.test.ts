import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and strips accents", () => {
    expect(slugify("Développement Web")).toBe("developpement-web");
  });

  it("replaces non-alphanumeric runs with a single hyphen", () => {
    expect(slugify("Café & Co.  Conseil!!")).toBe("cafe-co-conseil");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Éléonore--  ")).toBe("eleonore");
  });

  it("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});
