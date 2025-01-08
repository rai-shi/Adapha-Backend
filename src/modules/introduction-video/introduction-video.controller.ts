import { FastifyReply, FastifyRequest } from "fastify";
import {
    FilterOptions,
    PaginationOptions,
    SortingOptions,
} from "../../utils/data.util";
import {
    EditIntroductionVideoInput,
    IntroductionVideoInput,
} from "./introduction-video.schema";
import {
    createIntroductionVideo,
    deleteIntroductionVideo,
    getIntroductionVideoById,
    getIntroductionVideos,
    getIntroductionVideosByLanguage,
    updateIntroductionVideo,
} from "./introduction-video.service";

export async function createIntroductionVideoHandler(
  request: FastifyRequest<{
    Body: IntroductionVideoInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const newVideo = await createIntroductionVideo(body);
    return reply.status(201).send(newVideo);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getIntroductionVideosHandler(
  request: FastifyRequest<{
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  try {
    const { totalCount, data } = await getIntroductionVideos(request.query);
    return reply.send({ totalCount, data });
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getIntroductionVideoByIdHandler(
  request: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) {
  const id = request.params.id;

  try {
    const video = await getIntroductionVideoById(Number(id));
    if (!video) return reply.status(404).send({ message: "Award not found" });

    return reply.send(video);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function deleteIntroductionVideoHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    await deleteIntroductionVideo(id);
    return reply.send({ message: "Introduction video deleted successfully" });
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply
        .status(404)
        .send({ message: "Introduction video not found" });
    }

    reply.status(500).send({ error: "Failed to delete introduction video" });
  }
}

export async function updateIntroductionVideoHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Body: EditIntroductionVideoInput;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const body = request.body;

  try {
    const updatedVideo = await updateIntroductionVideo(Number(id), body);
    return reply.status(200).send(updatedVideo);
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({
        message: "Introduction video not found",
      });
    }

    return reply.status(500).send({
      message: "Failed to update introduction video",
      error: err.message,
    });
  }
}

export async function getIntroductionVideosByLanguageHandler(
  request: FastifyRequest<{ Params: { language: "en" | "tr" } }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const videos = await getIntroductionVideosByLanguage(language);
    return reply.send(videos);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}
