import { describe, it, expect } from "vitest";
import { createBrand } from "../lib/brand";

describe("createBrand", () => {
  it("creates a brand with prefix and full name", () => {
    const brand = createBrand({
      name: "Event",
      iconPaths: { dark: "/icons/logo-white.png", light: "/icons/logo-black.png" },
    });
    expect(brand.prefix).toBe("MyResto");
    expect(brand.name).toBe("Event");
    expect(brand.full).toBe("MyRestoEvent");
  });

  it("uses default icon sizes", () => {
    const brand = createBrand({
      name: "Club",
      iconPaths: { dark: "/d.png", light: "/l.png" },
    });
    expect(brand.iconSize.navbar).toBe(22);
    expect(brand.iconSize.sidebar).toBe(20);
    expect(brand.iconSize.mobile).toBe(18);
  });

  it("allows custom icon sizes", () => {
    const brand = createBrand({
      name: "Garage",
      iconPaths: { dark: "/d.png", light: "/l.png" },
      iconSizes: { navbar: 30, sidebar: 28 },
    });
    expect(brand.iconSize.navbar).toBe(30);
    expect(brand.iconSize.sidebar).toBe(28);
    expect(brand.iconSize.mobile).toBe(18); // default
  });

  it("passes through icon paths", () => {
    const brand = createBrand({
      name: "Hub",
      iconPaths: { dark: "/dark.png", light: "/light.png" },
    });
    expect(brand.icon.dark).toBe("/dark.png");
    expect(brand.icon.light).toBe("/light.png");
  });
});
