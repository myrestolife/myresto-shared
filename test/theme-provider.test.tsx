import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "../lib/theme";

function ThemeConsumer() {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeProvider + useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "";
  });

  it("provides default dark theme", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    // After mount effect, theme resolves (matchMedia mock returns dark)
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("reads stored theme from localStorage", () => {
    localStorage.setItem("myresto-theme", "light");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("setTheme updates the theme and persists it", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set Light"));
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(localStorage.getItem("myresto-theme")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("toggleTheme toggles between dark and light", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Toggle"));
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("light");

    act(() => {
      fireEvent.click(screen.getByText("Toggle"));
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("applies theme to document.documentElement.dataset", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set Dark"));
    });

    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
