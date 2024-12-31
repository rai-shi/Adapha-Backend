// AWARD CONTROLLER

import { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import {
  createAward,
  deleteAward,
  getAwardById,
  getAwards,
  getAwardByIdAndLanguage,
  getAwardsByLanguage,
  updateAward,
} from "./award.service";
import { AwardInput, EditAwardInput } from "./award.schema";

export async function createAwardHandler(
  request: FastifyRequest<{
    Body: AwardInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const newAward = await createAward(body);
    return reply.status(201).send(newAward);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getAwardsHandler(
  request: FastifyRequest<{
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  try {
    const { totalCount, data } = await getAwards(request.query);
    return reply.send({ totalCount, data });
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch awards" });
  }
}

export async function getAwardsByLanguageHandler(
  request: FastifyRequest<{
    Params: { language: "en" | "tr" };
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const { totalCount, data } = await getAwardsByLanguage(
      language,
      request.query
    );
    return reply.send({ totalCount, data });
  } catch (error) {
    reply
      .status(500)
      .send({ error: `Failed to fetch awards for ${language}` });
  }
}

export async function getAwardByIdHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    const award = await getAwardById(id);
    if (!award) {
      return reply.status(404).send({ message: "Award not found" });
    }
    return reply.send(award);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch award" });
  }
}

export async function getAwardByIdAndLanguageHandler(
  request: FastifyRequest<{ Params: { id: string; language: "en" | "tr" } }>,
  reply: FastifyReply
) {
  const { language } = request.params;
  const id = Number(request.params.id);

  try {
    const award = await getAwardByIdAndLanguage(id, language);
    return reply.send(award);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Award not found" });
    }

    reply.status(500).send({ error: `Failed to fetch award for ${language}` });
  }
}

export async function deleteAwardHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    await deleteAward(id);
    return reply.send({ message: "Award deleted successfully" });
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Award not found" });
    }

    reply.status(500).send({ error: "Failed to delete award" });
  }
}

export async function updateAwardHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: EditAwardInput }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  const body = request.body;

  try {
    const updatedAward = await updateAward(id, body);
    return reply.send(updatedAward);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Award not found" });
    }

    reply.status(500).send({ error: "Failed to update award" });
  }
}
