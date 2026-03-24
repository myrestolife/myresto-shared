import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "../components/Footer";

describe("Footer", () => {
  it("renders appName in copyright text", () => {
    render(<Footer appName="MyTestApp" />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} MyTestApp · Part of MyRestoLife`)
    ).toBeInTheDocument();
  });

  it("renders default links when none provided", () => {
    render(<Footer appName="MyTestApp" />);
    expect(screen.getByText("MyRestoEvent")).toBeInTheDocument();
    expect(screen.getByText("MyRestoClub")).toBeInTheDocument();
    expect(screen.getByText("MyRestoGarage")).toBeInTheDocument();
  });

  it("renders custom links when provided", () => {
    const links = [
      { href: "https://example.com", label: "Example" },
      { href: "https://other.com", label: "Other" },
    ];
    render(<Footer appName="MyTestApp" links={links} />);
    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
    expect(screen.queryByText("MyRestoEvent")).not.toBeInTheDocument();
    expect(screen.queryByText("MyRestoClub")).not.toBeInTheDocument();
    expect(screen.queryByText("MyRestoGarage")).not.toBeInTheDocument();
  });

  it("shows commit hash when provided", () => {
    render(<Footer appName="MyTestApp" commitHash="abc1234" />);
    expect(screen.getByText(/abc1234/)).toBeInTheDocument();
  });

  it("does not show commit hash when omitted", () => {
    const { container } = render(<Footer appName="MyTestApp" />);
    expect(container.textContent).not.toContain("abc1234");
  });
});
