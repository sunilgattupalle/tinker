import { describe, it, expect, beforeEach } from "vitest";
import { saveProject, loadSavedProject, hasSavedProject, clearSavedProject } from "./index";
import type { Project } from "@/types";

const testProject: Project = {
  name: "Test Project",
  sprites: [],
  stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
  activeSpriteId: "s1",
};

describe("localStorage persistence", () => {
  beforeEach(() => {
    clearSavedProject();
  });

  it("reports no saved project initially", () => {
    expect(hasSavedProject()).toBe(false);
  });

  it("saves and loads a project", () => {
    saveProject(testProject);
    expect(hasSavedProject()).toBe(true);
    const loaded = loadSavedProject();
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe("Test Project");
  });

  it("clears a saved project", () => {
    saveProject(testProject);
    clearSavedProject();
    expect(hasSavedProject()).toBe(false);
    expect(loadSavedProject()).toBeNull();
  });
});
