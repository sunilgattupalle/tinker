import { describe, it, expect } from "vitest";
import { serializeProject, deserializeProject } from "./serializer";
import type { Project } from "@/types";

const mockProject: Project = {
  name: "Test Project",
  sprites: [
    {
      id: "sprite-1",
      name: "Sprite1",
      x: 0,
      y: 0,
      direction: 90,
      size: 100,
      visible: true,
      costumes: [
        {
          name: "cat",
          url: "/assets/sprites/cat.svg",
          width: 48,
          height: 48,
          centerX: 24,
          centerY: 24,
        },
      ],
      currentCostumeIndex: 0,
      scripts: [
        {
          id: "script-1",
          hatBlockId: "block-1",
          blocks: {
            "block-1": {
              id: "block-1",
              definitionId: "events_flag",
              args: {},
              next: "block-2",
              parent: null,
            },
            "block-2": {
              id: "block-2",
              definitionId: "motion_move",
              args: { STEPS: 10 },
              next: null,
              parent: "block-1",
            },
          },
        },
      ],
      rotationStyle: "all_around",
    },
  ],
  stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
  activeSpriteId: "sprite-1",
};

describe("serializeProject", () => {
  it("should serialize a project with metadata", () => {
    const shared = serializeProject(mockProject, {
      author: "TestUser",
      description: "A test project",
      thumbnail: "data:image/png;base64,test",
    });

    expect(shared.version).toBe(1);
    expect(shared.name).toBe("Test Project");
    expect(shared.author).toBe("TestUser");
    expect(shared.description).toBe("A test project");
    expect(shared.thumbnail).toBe("data:image/png;base64,test");
    expect(shared.project).toEqual(mockProject);
    expect(typeof shared.createdAt).toBe("string");
  });

  it("should serialize without optional metadata", () => {
    const shared = serializeProject(mockProject);

    expect(shared.version).toBe(1);
    expect(shared.name).toBe("Test Project");
    expect(shared.author).toBeUndefined();
    expect(shared.description).toBeUndefined();
    expect(shared.thumbnail).toBeUndefined();
  });
});

describe("deserializeProject", () => {
  it("should deserialize a valid shared project", () => {
    const shared = serializeProject(mockProject);
    const deserialized = deserializeProject(shared);

    expect(deserialized).toEqual(mockProject);
  });

  it("should throw on unsupported version", () => {
    const shared = serializeProject(mockProject);
    const invalidVersion = { ...shared, version: 2 as 1 };

    expect(() => deserializeProject(invalidVersion)).toThrow(
      "Unsupported project version: 2"
    );
  });

  it("should throw on missing required fields", () => {
    const shared = serializeProject(mockProject);
    const invalid = { ...shared, project: { ...shared.project, name: "" } };

    expect(() => deserializeProject(invalid)).toThrow(
      "Invalid project data: missing required fields"
    );
  });

  it("should throw on unknown block definition", () => {
    const shared = serializeProject(mockProject);
    shared.project.sprites[0].scripts[0].blocks["block-1"].definitionId =
      "unknown_block";

    expect(() => deserializeProject(shared)).toThrow(/Unknown block definition/);
  });

  it("should fix invalid activeSpriteId", () => {
    const shared = serializeProject({
      ...mockProject,
      sprites: [
        {
          ...mockProject.sprites[0],
          scripts: [],
        },
      ],
    });
    shared.project.activeSpriteId = "invalid-id";

    const deserialized = deserializeProject(shared);
    expect(deserialized.activeSpriteId).toBe("sprite-1");
  });
});
