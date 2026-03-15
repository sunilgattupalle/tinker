import type { Sprite, StageConfig } from "@/types";
import { stageToCanvas } from "./engine";

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(url: string): HTMLImageElement | null {
  const cached = imageCache.get(url);
  if (cached?.complete) return cached;

  if (!cached) {
    const img = new Image();
    img.src = url;
    imageCache.set(url, img);
  }
  return null;
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  sprites: Sprite[],
  stage: StageConfig,
  speechBubbles: Map<string, { text: string; expiresAt: number | null }>,
): void {
  ctx.clearRect(0, 0, stage.width, stage.height);

  ctx.fillStyle = stage.backdrop;
  ctx.fillRect(0, 0, stage.width, stage.height);

  for (const sprite of sprites) {
    if (!sprite.visible) continue;

    const { cx, cy } = stageToCanvas(sprite.x, sprite.y, stage);
    const costume = sprite.costumes[sprite.currentCostumeIndex];

    ctx.save();
    ctx.translate(cx, cy);

    const rad = ((sprite.direction - 90) * Math.PI) / 180;
    if (sprite.rotationStyle === "all_around") {
      ctx.rotate(rad);
    } else if (sprite.rotationStyle === "left_right") {
      if (sprite.direction > 180) {
        ctx.scale(-1, 1);
      }
    }

    const scale = sprite.size / 100;

    if (costume) {
      const img = loadImage(costume.url);
      if (img) {
        const w = costume.width * scale;
        const h = costume.height * scale;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } else {
        drawPlaceholder(ctx, scale);
      }
    } else {
      drawPlaceholder(ctx, scale);
    }

    ctx.restore();

    const bubble = speechBubbles.get(sprite.id);
    if (bubble) {
      if (bubble.expiresAt !== null && Date.now() > bubble.expiresAt) {
        speechBubbles.delete(sprite.id);
      } else {
        drawSpeechBubble(ctx, cx, cy, sprite.size, bubble.text);
      }
    }
  }
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, scale: number): void {
  const size = 24 * scale;
  ctx.fillStyle = "#FFAB19";
  ctx.strokeStyle = "#E69500";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-size * 0.3, -size * 0.15, size * 0.2, 0, Math.PI * 2);
  ctx.arc(size * 0.3, -size * 0.15, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2D2D2D";
  ctx.beginPath();
  ctx.arc(-size * 0.25, -size * 0.1, size * 0.1, 0, Math.PI * 2);
  ctx.arc(size * 0.35, -size * 0.1, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spriteSize: number,
  text: string,
): void {
  const offset = (spriteSize / 100) * 30 + 10;
  const bx = cx + 10;
  const by = cy - offset;

  ctx.font = '13px "Nunito", sans-serif';
  const metrics = ctx.measureText(text);
  const tw = Math.min(metrics.width + 16, 200);
  const th = 28;

  ctx.fillStyle = "white";
  ctx.strokeStyle = "#E2E0DC";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx - 4, by - th, tw, th, 8);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bx + 4, by);
  ctx.lineTo(bx + 12, by + 8);
  ctx.lineTo(bx + 16, by);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.fillStyle = "#2D2D2D";
  ctx.textBaseline = "middle";
  ctx.fillText(text, bx + 4, by - th / 2, tw - 16);
}

export function hitTestSprite(
  sprite: Sprite,
  canvasX: number,
  canvasY: number,
  stage: StageConfig,
): boolean {
  if (!sprite.visible) return false;
  const { cx, cy } = stageToCanvas(sprite.x, sprite.y, stage);
  const costume = sprite.costumes[sprite.currentCostumeIndex];
  const scale = sprite.size / 100;
  const halfW = ((costume?.width ?? 48) * scale) / 2;
  const halfH = ((costume?.height ?? 48) * scale) / 2;
  return (
    canvasX >= cx - halfW &&
    canvasX <= cx + halfW &&
    canvasY >= cy - halfH &&
    canvasY <= cy + halfH
  );
}
