import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "@/store/project";
import { buildProjectContext, describeProject } from "./context";

describe("Project Context", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it("builds a project context with sprites and available blocks", () => {
    const project = useProjectStore.getState().project;
    const ctx = buildProjectContext(project);
    expect(ctx.sprites).toHaveLength(1);
    expect(ctx.sprites[0].name).toBe("Sprite1");
    expect(ctx.availableBlocks.length).toBeGreaterThan(0);
    expect(ctx.activeSpriteId).toBe(project.activeSpriteId);
  });

  it("describes the project as a readable string", () => {
    const project = useProjectStore.getState().project;
    const desc = describeProject(project);
    expect(desc).toContain("My Project");
    expect(desc).toContain("Sprite1");
    expect(desc).toContain("Scripts: none yet");
  });
});
