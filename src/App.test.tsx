import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { App } from "./App";
import { useProjectStore } from "./store/project";
import { useUIStore } from "./store/ui";

describe("App", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
    useUIStore.getState().clearChat();
  });

  it("renders the welcome screen on initial load", () => {
    render(<App />);
    expect(screen.getByText("What do you want to make?")).toBeInTheDocument();
    expect(screen.getByText("Pet Simulator")).toBeInTheDocument();
    expect(screen.getByText("Quiz Game")).toBeInTheDocument();
    expect(screen.getByText("Story with Choices")).toBeInTheDocument();
  });

  it("shows the editor after selecting blank project", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Blank project"));
    expect(screen.getByLabelText("Run project")).toBeInTheDocument();
    expect(screen.getByLabelText("Chat input")).toBeInTheDocument();
    expect(screen.getByText("Blocks")).toBeInTheDocument();
  });

  it("loads a template when clicking a template card", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Pet Simulator"));
    expect(screen.getByLabelText("Run project")).toBeInTheDocument();
    expect(useProjectStore.getState().project.name).toBe("Pet Simulator");
  });

  it("shows Cosmo greeting after loading a template", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Quiz Game"));
    expect(screen.getByText(/Great choice! This is a quiz game/)).toBeInTheDocument();
  });
});
