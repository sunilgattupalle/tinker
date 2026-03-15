import { describe, it, expect } from "vitest";
import { loadTemplate, TEMPLATES, getTemplateInfo } from "./index";

describe("Template System", () => {
  it("lists three templates", () => {
    expect(TEMPLATES).toHaveLength(3);
  });

  it("each template has required info fields", () => {
    for (const tmpl of TEMPLATES) {
      expect(tmpl.id).toBeTruthy();
      expect(tmpl.name).toBeTruthy();
      expect(tmpl.description).toBeTruthy();
      expect(tmpl.icon).toBeTruthy();
      expect(tmpl.cosmoGreeting).toBeTruthy();
    }
  });

  it("loads pet-sim template with sprites and scripts", () => {
    const project = loadTemplate("pet-sim");
    expect(project).not.toBeNull();
    expect(project!.name).toBe("Pet Simulator");
    expect(project!.sprites).toHaveLength(1);
    expect(project!.sprites[0].name).toBe("Cat");
    expect(project!.sprites[0].scripts.length).toBeGreaterThanOrEqual(4);
  });

  it("pet-sim has arrow key scripts", () => {
    const project = loadTemplate("pet-sim")!;
    const cat = project.sprites[0];
    const hatDefs = cat.scripts.map(
      (s) => s.blocks[s.hatBlockId]?.definitionId,
    );
    expect(hatDefs.filter((d) => d === "events_key").length).toBeGreaterThanOrEqual(4);
  });

  it("loads quiz-game template", () => {
    const project = loadTemplate("quiz-game");
    expect(project).not.toBeNull();
    expect(project!.name).toBe("Quiz Game");
    expect(project!.sprites[0].name).toBe("QuizHost");
    const hatDefs = project!.sprites[0].scripts.map(
      (s) => s.blocks[s.hatBlockId]?.definitionId,
    );
    expect(hatDefs).toContain("events_flag");
  });

  it("loads story-choices template", () => {
    const project = loadTemplate("story-choices");
    expect(project).not.toBeNull();
    expect(project!.name).toBe("Story with Choices");
    expect(project!.sprites[0].scripts.length).toBeGreaterThanOrEqual(3);
  });

  it("returns null for unknown template", () => {
    expect(loadTemplate("nonexistent")).toBeNull();
  });

  it("getTemplateInfo returns info for valid ID", () => {
    const info = getTemplateInfo("pet-sim");
    expect(info).toBeDefined();
    expect(info!.name).toBe("Pet Simulator");
  });

  it("each template has valid block chains", () => {
    for (const tmpl of TEMPLATES) {
      const project = loadTemplate(tmpl.id)!;
      for (const sprite of project.sprites) {
        for (const script of sprite.scripts) {
          const hat = script.blocks[script.hatBlockId];
          expect(hat).toBeDefined();
          expect(hat.parent).toBeNull();
        }
      }
    }
  });
});
