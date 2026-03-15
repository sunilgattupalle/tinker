const THUMBNAIL_WIDTH = 100;
const THUMBNAIL_HEIGHT = 75;

export function generateThumbnail(canvas: HTMLCanvasElement): string {
  try {
    const thumbnailCanvas = document.createElement("canvas");
    thumbnailCanvas.width = THUMBNAIL_WIDTH;
    thumbnailCanvas.height = THUMBNAIL_HEIGHT;

    const ctx = thumbnailCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context for thumbnail");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(canvas, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

    return thumbnailCanvas.toDataURL("image/png");
  } catch (error) {
    console.error("Failed to generate thumbnail:", error);
    return "";
  }
}
