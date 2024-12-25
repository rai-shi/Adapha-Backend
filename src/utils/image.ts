import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function processImage(
  filename: string,
  quality: number,
  height?: number,
  width?: number,
  blur?: number
): Promise<Buffer> {
  const filePath = path.join(__dirname, "../../uploads", filename);

  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }

  let image = sharp(filePath).webp({ quality });

  if (height || width) {
    image = image.resize(height, width);
  }

  if (blur) {
    image = image.blur(blur);
  }

  return await image.toBuffer();
}

export function deleteImage(filename: string) {
  const filePath = path.resolve("uploads", filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error("Failed to delete image");
    }
  });
}
