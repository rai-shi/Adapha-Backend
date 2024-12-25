import { FastifyReply, FastifyRequest } from "fastify";
import { EditCategoryInput, NewCategoryInput } from "./new-category.schema";
import {
  createNewCategory,
  deleteNewCategory,
  getAllNewCategories,
  getNewCategoriesByLanguage,
  getNewCategoryById,
  getNewCategoryByIdAndLanguage,
  updateNewCategory
} from "./new-category.service";

export async function createNewCategoryHandler(
  request: FastifyRequest<{
    Body: NewCategoryInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const newCategory = await createNewCategory(body);
    return reply.status(201).send(newCategory);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getAllNewCategoriesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const categories = await getAllNewCategories();
    return reply.send(categories);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch categories" });
  }
}

export async function getNewCategoriesByLanguageHandler(
  request: FastifyRequest<{ Params: { language: "en" | "tr" } }>,
  reply: FastifyReply
) {
  const { language } = request.params;

  try {
    const categories = await getNewCategoriesByLanguage(language);
    return reply.send(categories);
  } catch (error) {
    reply
      .status(500)
      .send({ error: `Failed to fetch categories for ${language}` });
  }
}

export async function getNewCategoryByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    const category = await getNewCategoryById(id);
    return reply.send(category);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch category" });
  }
}

export async function getNewCategoriesByIdAndLanguageHandler(
  request: FastifyRequest<{ Params: { id: string; language: "en" | "tr" } }>,
  reply: FastifyReply
) {
  const { language } = request.params;
  const id = Number(request.params.id);

  try {
    const newCategory = await getNewCategoryByIdAndLanguage(id, language);
    return reply.send(newCategory);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "New category not found" });
    }

    reply
      .status(500)
      .send({ error: `Failed to fetch new category for ${language}` });
  }
}

export async function deleteNewCategoryHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    await deleteNewCategory(id);
    return reply.send({ message: "New category deleted successfully" });
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "New category not found" });
    }

    reply.status(500).send({ error: "Failed to delete new category" });
  }
}

export async function updateNewCategoryHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: EditCategoryInput }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);
  const body = request.body;

  try {
    const newCategory = await updateNewCategory(id, body);
    return reply.send(newCategory);
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "New category not found" });
    }

    reply.status(500).send({ error: "Failed to update new category" });
  }
}
