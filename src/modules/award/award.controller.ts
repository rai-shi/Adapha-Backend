import { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { AwardInput } from "./award.schema";
import {
  createAward,
  deleteAward,
  getAwardById,
  getAwards,
} from "./award.service";

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
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
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
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
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
    const err = error as Error;

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Award not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}
