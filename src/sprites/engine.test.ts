import { describe, it, expect } from "vitest";
import type { Sprite } from "@/types";
import {
  moveSpriteSteps,
  turnRight,
  turnLeft,
  goTo,
  setX,
  setY,
  setSpriteSize,
  showSprite,
  hideSprite,
  stageToCanvas,
} from "./engine";

function makeSprite(overrides?: Partial<Sprite>): Sprite {
  return {
    id: "test-sprite",
    name: "Test",
    x: 0,
    y: 0,
    direction: 90,
    size: 100,
    visible: true,
    costumes: [],
    currentCostumeIndex: 0,
    scripts: [],
    rotationStyle: "all_around",
    ...overrides,
  };
}

describe("Sprite Engine", () => {
  describe("moveSpriteSteps", () => {
    it("moves right when direction is 90", () => {
      const s = makeSprite({ direction: 90 });
      const result = moveSpriteSteps(s, 10);
      expect(result.x).toBeCloseTo(10);
      expect(result.y).toBeCloseTo(0);
    });

    it("moves up when direction is 0", () => {
      const s = makeSprite({ direction: 0 });
      const result = moveSpriteSteps(s, 10);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(10);
    });

    it("clamps to stage boundaries", () => {
      const s = makeSprite({ x: 230 });
      const result = moveSpriteSteps(s, 100);
      expect(result.x).toBe(240);
    });
  });

  describe("turnRight / turnLeft", () => {
    it("turns right by adding degrees", () => {
      const s = makeSprite({ direction: 90 });
      expect(turnRight(s, 15).direction).toBe(105);
    });

    it("turns left by subtracting degrees", () => {
      const s = makeSprite({ direction: 90 });
      expect(turnLeft(s, 15).direction).toBe(75);
    });

    it("wraps around 360", () => {
      const s = makeSprite({ direction: 350 });
      expect(turnRight(s, 20).direction).toBe(10);
    });
  });

  describe("goTo", () => {
    it("sets x and y", () => {
      const s = makeSprite();
      const result = goTo(s, 100, -50);
      expect(result.x).toBe(100);
      expect(result.y).toBe(-50);
    });

    it("clamps to boundaries", () => {
      const s = makeSprite();
      const result = goTo(s, 999, -999);
      expect(result.x).toBe(240);
      expect(result.y).toBe(-180);
    });
  });

  describe("setX / setY", () => {
    it("sets x only", () => {
      const s = makeSprite({ y: 50 });
      const result = setX(s, 100);
      expect(result.x).toBe(100);
      expect(result.y).toBe(50);
    });

    it("sets y only", () => {
      const s = makeSprite({ x: 50 });
      const result = setY(s, -100);
      expect(result.x).toBe(50);
      expect(result.y).toBe(-100);
    });
  });

  describe("visibility", () => {
    it("hides a sprite", () => {
      const s = makeSprite({ visible: true });
      expect(hideSprite(s).visible).toBe(false);
    });

    it("shows a sprite", () => {
      const s = makeSprite({ visible: false });
      expect(showSprite(s).visible).toBe(true);
    });
  });

  describe("setSpriteSize", () => {
    it("sets the size", () => {
      const s = makeSprite();
      expect(setSpriteSize(s, 200).size).toBe(200);
    });

    it("enforces minimum size of 1", () => {
      const s = makeSprite();
      expect(setSpriteSize(s, -10).size).toBe(1);
    });
  });

  describe("stageToCanvas", () => {
    it("converts center (0,0) to canvas center (240,180)", () => {
      const { cx, cy } = stageToCanvas(0, 0);
      expect(cx).toBe(240);
      expect(cy).toBe(180);
    });

    it("converts top-right stage coords correctly", () => {
      const { cx, cy } = stageToCanvas(240, 180);
      expect(cx).toBe(480);
      expect(cy).toBe(0);
    });
  });
});
