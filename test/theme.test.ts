import { describe, it, expect, beforeEach } from "vitest";
import { initTheme, getTheme, setStoredTheme } from "../lib/theme";

describe("theme standalone functions", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  describe("getTheme", () => {
    it('returns "dark" when localStorage is empty', () => {
      expect(getTheme()).toBe("dark");
    });

    it("returns the theme stored in localStorage", () => {
      localStorage.setItem("myresto-theme", "light");
      expect(getTheme()).toBe("light");
    });

    it('returns "dark" after localStorage is cleared', () => {
      localStorage.setItem("myresto-theme", "light");
      localStorage.clear();
      expect(getTheme()).toBe("dark");
    });
  });

  describe("setStoredTheme", () => {
    it("persists the theme to localStorage", () => {
      setStoredTheme("light");
      expect(localStorage.getItem("myresto-theme")).toBe("light");
    });

    it("applies the theme to document.documentElement.dataset.theme", () => {
      setStoredTheme("light");
      expect(document.documentElement.dataset.theme).toBe("light");
    });

    it("overwrites a previously stored theme", () => {
      setStoredTheme("light");
      setStoredTheme("dark");
      expect(localStorage.getItem("myresto-theme")).toBe("dark");
      expect(document.documentElement.dataset.theme).toBe("dark");
    });
  });

  describe("initTheme", () => {
    it('applies the default "dark" theme to the DOM when nothing is stored', () => {
      initTheme();
      expect(document.documentElement.dataset.theme).toBe("dark");
    });

    it("applies the stored theme to the DOM", () => {
      localStorage.setItem("myresto-theme", "light");
      initTheme();
      expect(document.documentElement.dataset.theme).toBe("light");
    });

    it("is consistent with getTheme after being called", () => {
      localStorage.setItem("myresto-theme", "light");
      initTheme();
      expect(document.documentElement.dataset.theme).toBe(getTheme());
    });
  });
});
