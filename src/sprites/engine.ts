import type { Sprite, StageConfig } from "@/types";

const HALF_W = 240;
const HALF_H = 180;

export function moveSpriteSteps(sprite: Sprite, steps: number): Sprite {
  const rad = ((sprite.direction - 90) * Math.PI) / 180;
  const nx = sprite.x + steps * Math.cos(rad);
  const ny = sprite.y - steps * Math.sin(rad);
  return clampToStage({ ...sprite, x: nx, y: ny });
}

export function turnRight(sprite: Sprite, degrees: number): Sprite {
  return { ...sprite, direction: (sprite.direction + degrees) % 360 };
}

export function turnLeft(sprite: Sprite, degrees: number): Sprite {
  return { ...sprite, direction: ((sprite.direction - degrees) % 360 + 360) % 360 };
}

export function goTo(sprite: Sprite, x: number, y: number): Sprite {
  return clampToStage({ ...sprite, x, y });
}

export function setX(sprite: Sprite, x: number): Sprite {
  return clampToStage({ ...sprite, x });
}

export function setY(sprite: Sprite, y: number): Sprite {
  return clampToStage({ ...sprite, y });
}

export function setSpriteSize(sprite: Sprite, percent: number): Sprite {
  return { ...sprite, size: Math.max(1, percent) };
}

export function showSprite(sprite: Sprite): Sprite {
  return { ...sprite, visible: true };
}

export function hideSprite(sprite: Sprite): Sprite {
  return { ...sprite, visible: false };
}

function clampToStage(sprite: Sprite): Sprite {
  const x = Math.max(-HALF_W, Math.min(HALF_W, sprite.x));
  const y = Math.max(-HALF_H, Math.min(HALF_H, sprite.y));
  return { ...sprite, x, y };
}

export function stageToCanvas(
  sx: number,
  sy: number,
  _stage?: StageConfig,
): { cx: number; cy: number } {
  void _stage;
  return { cx: sx + HALF_W, cy: HALF_H - sy };
}
