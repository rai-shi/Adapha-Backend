import { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { NewInput, UpdateNewInput } from "./new.schema";
import {
  createNew,
  deleteNew,
  getAllFeaturedNews,
  getAllFeaturedNewsByLanguage,
  getAllNews,
  getAllNewsByLangauge,
  getAllNewsPlainByLanguage,
  getAllNonFeaturedNews,
  getNewById,
  getNewByIdAndLanguage,
  getRelatedNews,
  updateFeaturedNew,
  updateNew,
} from "./new.service";

export async function createNewHandler(
  request: FastifyRequest<{ Body: NewInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const newRecord = await createNew(body);
    return reply.status(201).send(newRecord);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "CATEGORY_NOT_FOUND") {
      return reply.status(404).send({ message: "New category not found" });
    }

    if (err.message === "DUPLICATE_RECORD") {
      return reply.status(409).send({ message: "Duplicate record" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getAllNewsHandler(
  request: FastifyRequest<{
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  try {
    const { totalCount, data } = await getAllNews(request.query);
    return reply.send({ totalCount, data });
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getAllFeaturedNewsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const news = await getAllFeaturedNews();
    return reply.send(news);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getAllNonFeaturedNewsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const news = await getAllNonFeaturedNews();
    return reply.send(news);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getAllFeaturedNewsByLanguageHandler(
  request: FastifyRequest<{
    Params: { language: "en" | "tr" };
  }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const data = await getAllFeaturedNewsByLanguage(language);
    return reply.send(data);
  } catch (error) {
    reply
      .status(500)
      .send({ error: `Failed to fetch featured news for ${language}` });
  }
}

export async function getNewByIdHandler(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  try {
    const newRecord = await getNewById(Number(id));
    return reply.send(newRecord);
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "New not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getNewByLanguageHandler(
  request: FastifyRequest<{
    Params: { language: "en" | "tr" };
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const { totalCount, data } = await getAllNewsByLangauge(
      language,
      request.query
    );
    return reply.send({ totalCount, data });
  } catch (error) {
    reply
      .status(500)
      .send({ error: `Failed to fetch categories for ${language}` });
  }
}

export async function getNewByIdAndLanguageHandler(
  request: FastifyRequest<{ Params: { id: string; language: "en" | "tr" } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { language } = request.params;

  try {
    const news = await getNewByIdAndLanguage(Number(id), language);

    return reply.status(200).send(news);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "News not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

export async function deleteNewHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  try {
    await deleteNew(Number(id));
    return reply.status(204).send({ message: "New deleted successfully" });
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "New not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function updateNewHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateNewInput;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const body = request.body;

  try {
    const updatedNew = await updateNew(Number(id), body);
    return reply.status(200).send(updatedNew);
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({
        message: "New not found",
      });
    }

    if (err.message === "CATEGORY_NOT_FOUND") {
      return reply.status(404).send({
        message: "Category not found",
      });
    }

    return reply.status(500).send({
      message: "Failed to update new record",
      error: err.message,
    });
  }
}

export async function updateFeaturedNewHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  try {
    await updateFeaturedNew(id);
    return reply.send("New updated successfully");
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "New not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getRelatedNewsHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
      language: "en" | "tr";
    };
  }>,
  reply: FastifyReply
) {
  const { id, language } = request.params;

  try {
    const data = await getRelatedNews(Number(id), language, 3);
    return reply.send(data);
  } catch (error) {
    reply.status(500).send({ error: `Failed to fetch news for ${language}` });
  }
}

export async function getAllNewsByLanguageHandler(
  request: FastifyRequest<{
    Params: { language: "en" | "tr" };
  }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const data = await getAllNewsPlainByLanguage(language);
    return reply.send(data);
  } catch (error) {
    reply
      .status(500)
      .send({ error: `Failed to fetch categories for ${language}` });
  }
}
