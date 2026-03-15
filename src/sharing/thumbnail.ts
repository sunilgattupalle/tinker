export function generateThumbnail(canvas: HTMLCanvasElement): string {
  const thumb = document.createElement('canvas')
  thumb.width = 160
  thumb.height = 120
  const ctx = thumb.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height)
  return thumb.toDataURL('image/png')
}
