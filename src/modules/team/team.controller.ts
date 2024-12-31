import { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";

import { EditTeamMemberInput, TeamMemberInput } from "./team.schema";
import {
  createTeamMember,
  deleteTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  getTeamMembersByLanguage,
  updateTeamMember,
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
    const teamRecord = await getTeamMemberById(Number(id));
    return reply.send(teamRecord);
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
export async function updateTeamMemberHandler(
  request: FastifyRequest<{
    Params: { id: string };
    Body: EditTeamMemberInput;
  }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const body = request.body;

  try {
    const updatedTeamMember = await updateTeamMember(Number(id), body);
    return reply.status(200).send(updatedTeamMember);
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({
        message: "Team member not found",
      });
    }

    return reply.status(500).send({
      message: "Failed to update new record",
      error: err.message,
    });
  }
}

// delete team member
export async function deleteTeamMemberHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  try {
    await deleteTeamMember(Number(id));
    return reply
      .status(204)
      .send({ message: "Team member deleted successfully" });
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

export async function getTeamMembersByLanguageHandler(
  request: FastifyRequest<{
    Params: { language: "en" | "tr" };
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const { totalCount, data } = await getTeamMembersByLanguage(
      language,
      request.query
    );
    return reply.send({ totalCount, data });
  } catch (error) {
    reply
      .status(500)
      .send({ error: `Failed to fetch team members for ${language}` });
  }
}
