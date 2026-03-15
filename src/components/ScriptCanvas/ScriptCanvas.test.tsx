import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { describe, it, expect, beforeEach } from "vitest";
import { ScriptCanvas } from "./ScriptCanvas";
import { useProjectStore, generateId } from "@/store/project";

function renderCanvas() {
  return render(
    <DndContext>
      <ScriptCanvas />
    </DndContext>,
  );
}

describe("ScriptCanvas", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it("renders the empty state message when no scripts", () => {
    renderCanvas();
    expect(
      screen.getByText("Drag blocks here or ask Cosmo to help!"),
    ).toBeInTheDocument();
  });

  it("renders scripts when blocks are added", () => {
    const hat = {
      id: generateId(),
      definitionId: "events_flag",
      args: {},
      next: null,
      parent: null,
    };
    useProjectStore.getState().addScript(hat);

    renderCanvas();
    expect(screen.getByText(/when.*clicked/)).toBeInTheDocument();
  });
});
