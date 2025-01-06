import fs from "fs";
import path from "path";

export function deleteImage(filename: string) {
  const filePath = path.resolve("uploads", filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error("Failed to delete image");
    }
  });
}
