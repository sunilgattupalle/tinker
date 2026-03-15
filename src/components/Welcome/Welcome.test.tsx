import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Welcome } from "./Welcome";

describe("Welcome", () => {
  const defaultProps = {
    onSelectTemplate: vi.fn(),
    onBlankProject: vi.fn(),
    onContinue: vi.fn(),
  };

  it("renders the Tinker heading", () => {
    render(<Welcome {...defaultProps} />);
    expect(screen.getByText("Tinker")).toBeInTheDocument();
  });

  it("renders the 'What do you want to make?' prompt", () => {
    render(<Welcome {...defaultProps} />);
    expect(screen.getByText("What do you want to make?")).toBeInTheDocument();
  });

  it("renders all three template cards", () => {
    render(<Welcome {...defaultProps} />);
    expect(screen.getByText("Pet Simulator")).toBeInTheDocument();
    expect(screen.getByText("Quiz Game")).toBeInTheDocument();
    expect(screen.getByText("Story with Choices")).toBeInTheDocument();
  });

  it("renders blank project button", () => {
    render(<Welcome {...defaultProps} />);
    expect(screen.getByText("Blank project")).toBeInTheDocument();
  });

  it("calls onBlankProject when blank button is clicked", async () => {
    const user = userEvent.setup();
    const onBlank = vi.fn();
    render(<Welcome {...defaultProps} onBlankProject={onBlank} />);
    await user.click(screen.getByText("Blank project"));
    expect(onBlank).toHaveBeenCalledOnce();
  });

  it("calls onSelectTemplate when a template card is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Welcome {...defaultProps} onSelectTemplate={onSelect} />);
    await user.click(screen.getByText("Pet Simulator"));
    expect(onSelect).toHaveBeenCalledWith("pet-sim");
  });
});
