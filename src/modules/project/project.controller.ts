// project CONTROLLER

import { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  getProjectByIdAndLanguage,
  getProjectsByLanguage,
  updateProject,
} from "./project.service";
import { ProjectInput, EditProjectInput } from "./project.schema";

export async function createProjectHandler(
  request: FastifyRequest<{
    Body: ProjectInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const newProject = await createProject(body);
    return reply.status(201).send(newProject);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getProjectsHandler(
  request: FastifyRequest<{
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  try {
    const { totalCount, data } = await getProjects(request.query);
    return reply.send({ totalCount, data });
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch projects" });
  }
}

export async function getProjectsByLanguageHandler(
  request: FastifyRequest<{
    Params: { language: "en" | "tr" };
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const { totalCount, data } = await getProjectsByLanguage(
      language,
      request.query
    );
    return reply.send({ totalCount, data });
  } catch (error) {
    reply
      .status(500)
      .send({ error: `Failed to fetch projects for ${language}` });
  }
}

export async function getProjectByIdHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    const project = await getProjectById(id);
    if (!project) {
      return reply.status(404).send({ message: "Project not found" });
    }
    return reply.send(project);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch project" });
  }
}

export async function getProjectByIdAndLanguageHandler(
  request: FastifyRequest<{ Params: { id: string; language: "en" | "tr" } }>,
  reply: FastifyReply
) {
  const { language } = request.params;
  const id = Number(request.params.id);

  try {
    const project = await getProjectByIdAndLanguage(id, language);
    return reply.send(project);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Project not found" });
    }

    reply.status(500).send({ error: `Failed to fetch Project for ${language}` });
  }
}

export async function deleteProjectHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    await deleteProject(id);
    return reply.send({ message: "Project deleted successfully" });
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Project not found" });
    }

    reply.status(500).send({ error: "Failed to delete project" });
  }
}

export async function updateProjectHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: EditProjectInput }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  const body = request.body;

  try {
    const updatedProject = await updateProject(id, body);
    return reply.send(updatedProject);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Project not found" });
    }

    reply.status(500).send({ error: "Failed to update project" });
  }
}
