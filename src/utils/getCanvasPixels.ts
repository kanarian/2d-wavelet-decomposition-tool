export function getCanvasPixels(canvas: HTMLCanvasElement): number[][] {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available.");
  }

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const grayscaleValue = Math.floor((r + g + b) / 3);
      row.push(grayscaleValue);
    }
    pixels.push(row);
  }
  return pixels;
}
