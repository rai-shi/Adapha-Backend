import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import { resolve } from "path";

interface File {
  value: Buffer;
  filename: string;
  mimetype: string;
}

const IMAGE_MAX_SIZE = 4 * 1024 * 1024;
const VIDEO_MAX_SIZE = 8 * 1024 * 1024;

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

      if (value.length > IMAGE_MAX_SIZE) {
        return {
          message: "Total image size exceeds the limit (4 MB)",
        };
      }

      if (!validImageTypes.includes(mimetype)) {
        return {
          message: "Invalid file type",
        };
      }

      const sanitizedFilename = filename
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");

      const outputFilename = `${Date.now()}-${sanitizedFilename}`;
      const filePath = resolve(uploadDir, outputFilename);
      fileUrls.push(outputFilename);

      fs.writeFileSync(filePath, value);
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

export async function uploadVideoHandler<T>(videos: T) {
  const uploadDir = resolve(__dirname, "../../../uploads/videos");
  const flatVideos = Array.isArray(videos) ? videos.flat() : [videos];

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileUrls: string[] = [];
  const validVideoTypes = [
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/mkv",
    "video/webm",
  ];

  try {
    for (const file of flatVideos) {
      const { value, filename, mimetype } = file as File;

      if (value.length > VIDEO_MAX_SIZE) {
        return {
          message: "Total video size exceeds the limit (8 MB)",
        };
      }

      if (!validVideoTypes.includes(mimetype)) {
        return {
          message: "Invalid file type",
        };
      }

      const sanitizedFilename = filename
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");

      const outputFilename = `${Date.now()}-${sanitizedFilename}`;
      const filePath = resolve(uploadDir, outputFilename);
      fileUrls.push(outputFilename);

      fs.writeFileSync(filePath, value);
    }

    return {
      message: "Video uploaded successfully",
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

export async function postVideoHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { videos } = request.body as { videos: any };

  try {
    const videoUrls = await uploadVideoHandler(videos);
    reply.send(videoUrls);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
    });
  }
}
