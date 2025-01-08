import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";

interface File {
  value: Buffer;
  filename: string;
  mimetype: string;
}

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY as string;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: region,
});

export async function uploadToS3(
  file: Buffer,
  filename: string,
  mimeType: string
) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Body: file,
    ContentType: mimeType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return filename;
  } catch (error) {
    throw new Error("Error uploading to S3");
  }
}

export async function uploadImageHandler<T>(images: T) {
  const flatImages = Array.isArray(images) ? images.flat() : [images];

  const files: string[] = [];
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

      if (value.length > 4 * 1024 * 1024) {
        return {
          message: "Total image size exceeds the limit (4 MB)",
        };
      }

      const randomImageName = crypto.randomBytes(32).toString("hex");
      const fileResult = await uploadToS3(value, randomImageName, mimetype);
      files.push(fileResult);
    }

    return {
      message: "File uploaded successfully",
      data: {
        files: files,
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
  const flatVideos = Array.isArray(videos) ? videos.flat() : [videos];

  const files: string[] = [];
  const validVideoTypes = ["video/mp4", "video/avi", "video/mov", "video/mkv"];

  try {
    for (const file of flatVideos) {
      const { value, mimetype } = file as File;

      if (!validVideoTypes.includes(mimetype)) {
        return {
          message: "Invalid file type",
        };
      }

      if (value.length > 20 * 1024 * 1024) {
        return {
          message: "Total video size exceeds the limit (20 MB)",
        };
      }

      const randomVideoName = crypto.randomBytes(32).toString("hex");
      const fileResult = await uploadToS3(value, randomVideoName, mimetype);
      files.push(fileResult);
    }

    return {
      message: "File uploaded successfully",
      data: {
        files: files,
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
