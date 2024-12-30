import { FastifyReply, FastifyRequest } from "fastify";
import {
    FilterOptions,
    PaginationOptions,
    SortingOptions,
} from "../../utils/data.util";

import { TeamMemberInput } from "./team.schema";
import {
    createTeamMember,
    deleteTeamMember,
    getAllTeamMembers,
    getTeamMemberById,
} from "./team.service";

// import { TeamMember } from "@prisma/client";

// get all team members
export async function getAllTeamMembersHandler(
  request: FastifyRequest<{
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  try {
    const { totalCount, data } = await getAllTeamMembers(request.query);
    return reply.send({ totalCount, data });
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch team members" });
  }
}

// get team member
export async function getTeamMemberByIdHandler(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  try {
    const newRecord = await getTeamMemberById(Number(id));
    return reply.send(newRecord);
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Team member not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

// create new team member
export async function createTeamMemberHandler(
  request: FastifyRequest<{ Body: TeamMemberInput }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const teamMember = await createTeamMember(body);
    return reply.status(201).send(teamMember);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

// update team member
export async function updateTeamMemberHandler() {}

// delete team member
export async function deleteTeamMemberHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  try {
    await deleteTeamMember(Number(id));
    return reply.status(204).send({ message: "Team member deleted successfully" });
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Team member not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}
