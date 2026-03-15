import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { CosmoChat } from "./CosmoChat";
import { useUIStore } from "@/store/ui";
import { useProjectStore } from "@/store/project";

describe("CosmoChat", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
    useUIStore.getState().clearChat();
    useUIStore.getState().setCosmoThinking(false);
  });

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

  it("displays user messages right-aligned", () => {
    useUIStore.getState().addChatMessage({ role: "user", content: "Hello Cosmo!" });
    render(<CosmoChat />);
    expect(screen.getByText("Hello Cosmo!")).toBeInTheDocument();
  });

  it("displays cosmo messages with proposed blocks", () => {
    useUIStore.getState().addChatMessage({
      role: "cosmo",
      content: "Here are some blocks!",
      proposedBlocks: [
        { definitionId: "motion_move", args: { STEPS: 10 }, position: 0 },
      ],
    });
    render(<CosmoChat />);
    expect(screen.getByText("Here are some blocks!")).toBeInTheDocument();
    expect(screen.getByText("Accept ✓")).toBeInTheDocument();
    expect(screen.getByText("Try something else ↻")).toBeInTheDocument();
  });

  it("shows accepted state after accepting a proposal", async () => {
    useUIStore.getState().addChatMessage({
      role: "cosmo",
      content: "Here are some blocks!",
      proposedBlocks: [
        { definitionId: "events_flag", args: {}, position: 0 },
        { definitionId: "motion_move", args: { STEPS: 10 }, position: 1 },
      ],
    });

    const user = userEvent.setup();
    render(<CosmoChat />);
    await user.click(screen.getByText("Accept ✓"));

    expect(screen.getByText("✓ Added to canvas")).toBeInTheDocument();
    expect(screen.getByText(/Click the green flag/)).toBeInTheDocument();
  });

  it("shows thinking state", () => {
    useUIStore.getState().setCosmoThinking(true);
    render(<CosmoChat />);
    expect(screen.getByText("Cosmo is thinking")).toBeInTheDocument();
  });
});
