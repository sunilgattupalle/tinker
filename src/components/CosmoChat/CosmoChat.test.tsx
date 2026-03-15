import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { CosmoChat } from "./CosmoChat";

describe("CosmoChat", () => {
  it("displays the Cosmo welcome message", () => {
    render(<CosmoChat />);
    expect(
      screen.getByText(/I'm Cosmo.*Tell me what you want to build/),
    ).toBeInTheDocument();
  });

  it("renders a focusable chat input", () => {
    render(<CosmoChat />);
    const input = screen.getByLabelText("Chat input");
    expect(input).toBeInTheDocument();
    input.focus();
    expect(input).toHaveFocus();
  });

  it("accepts text in the chat input", async () => {
    const user = userEvent.setup();
    render(<CosmoChat />);
    const input = screen.getByLabelText("Chat input");
    await user.type(input, "make a cat jump");
    expect(input).toHaveValue("make a cat jump");
  });

  it("renders a send button", () => {
    render(<CosmoChat />);
    expect(screen.getByLabelText("Send message")).toBeInTheDocument();
  });
});
