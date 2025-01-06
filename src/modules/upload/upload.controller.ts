import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import { resolve } from "path";
import sharp from "sharp";
import { processImage } from "../../utils/image";

interface File {
  value: Buffer;
  filename: string;
  mimetype: string;
}

export async function uploadImageHandler<T>(images: T) {
  const uploadDir = resolve(__dirname, "../../../uploads");
  const flatImages = Array.isArray(images) ? images.flat() : [images];

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileUrls: string[] = [];
  const validImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  try {
    for (const file of flatImages) {
      const { value, filename, mimetype } = file as File;

      if (!validImageTypes.includes(mimetype)) {
        return {
          message: "Invalid file type",
        };
      }

      const sanitizedFilename = filename
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");

      const outputFilename = `${Date.now()}-${sanitizedFilename
        .split(".")
        .slice(0, -1)
        .join(".")}.webp`;
      const filePath = resolve(uploadDir, outputFilename);
      fileUrls.push(outputFilename);

      await sharp(value).webp({ quality: 70 }).toFile(filePath);
    }

    return {
      message: "File uploaded successfully",
      data: {
        url: fileUrls,
      },
    };
  } catch (error) {
    return {
      message: "Internal Server Error",
    };
  }
}

export async function postImageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { images } = request.body as { images: any };

  try {
    const imageUrls = await uploadImageHandler(images);
    reply.send(imageUrls);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
    });
  }
}

export async function getImageHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { filename } = request.params as { filename: string };
  const query = request.query as {
    q?: string;
    height?: string;
    width?: string;
    blur?: string;
  };

  const quality = parseInt(query.q || "90", 10);
  const height = parseInt(query.height || "0", 10);
  const width = parseInt(query.width || "0", 10);
  const blur = parseInt(query.blur || "0", 10);

  if (quality < 1 || quality > 100) {
    return reply.status(400).send({
      message: "Quality must be between 1 and 100.",
    });
  }

  try {
    const processedImage = await processImage(
      filename,
      quality,
      height,
      width,
      blur
    );
    reply.type("image/webp").send(processedImage);
  } catch (error: Error | any) {
    if (error.message === "File not found") {
      return reply.status(404).send({
        message: "File not found.",
      });
    }

    return reply.status(500).send({
      message: "Error processing the image.",
      error: error.message,
    });
  }
}
