// Project SERVICE

import {
  FilterOptions,
  manageData,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { db } from "../../utils/prisma";
import { EditProjectInput, ProjectInput } from "./project.schema";

  export async function createProject(data: ProjectInput) {
    try {
      const newProject = await db.project.create({
        data: {
          image: data.image,
          translations: {
            create: data.translations.map((translation) => ({
              language: translation.language,
              title: translation.title,
              description: translation.description,
            })),
          },
        },
        include: { translations: true },
      });
      return newProject;
    } catch (error) {
      throw new Error("Failed to create project");
    }
  }

  export async function getProjects(
    query: PaginationOptions & SortingOptions & FilterOptions
  ) {
    try {
      const projects = await db.project.findMany({
        include: { translations: true },
      });

      const { totalCount, data: paginatedProjects } = manageData(
        projects,
        query,
        true
      );
      return { totalCount, data: paginatedProjects };
    } catch (error) {
      throw new Error("Failed to fetch projects");
    }
  }

  export async function getProjectsByLanguage(
    language: "en" | "tr",
    query: PaginationOptions & SortingOptions & FilterOptions
  ) {
    try {
      const projects = await db.project.findMany({
        where: {
          translations: {
            some: { language },
          },
        },
        include: {
          translations: {
            where: { language },
          },
        },
      });

      const dataResult = projects.map((project) => ({
        id: project.id,
        image: project.image,
        title: project.translations[0].title,
        description: project.translations[0].description,
      }));

      const { totalCount, data: paginatedProjects } = manageData(
        dataResult,
        query,
        true
      );

      return { totalCount, data: paginatedProjects };
    } catch (error) {
      throw new Error("Failed to fetch projects by language");
    }
  }

  export async function getProjectById(id: number) {
    try {
      const project = await db.project.findUnique({
        where: { id },
        include: { translations: true },
      });
      return project;
    } catch (error) {
      throw new Error("Failed to fetch project");
    }
  }

  export async function getProjectByIdAndLanguage(
    id: number,
    language: "en" | "tr"
  ) {
    try {
      const project = await db.project.findUnique({
        where: { id },
        include: {
          translations: {
            where: { language },
          },
        },
      });

      if (!project || project.translations.length === 0) {
        throw new Error("NOT_FOUND");
      }

      return {
        id: project.id,
        title: project.translations[0].title,
        description: project.translations[0].description,
      };
    } catch (error) {
      if ((error as { message: string }).message === "NOT_FOUND") {
        throw new Error("NOT_FOUND");
      }
      throw new Error("Failed to fetch project by ID and language");
    }
  }

  export async function deleteProject(id: number) {
    try {
      await db.projectTranslation.deleteMany({
        where: { projectId: id },
      });

      const project = await db.project.delete({
        where: { id },
      });

      return project;
    } catch (error) {
      if ((error as { code: string }).code === "P2025") {
        throw new Error("NOT_FOUND");
      }
      throw new Error("Failed to delete project");
    }
  }
  export async function updateProject(id: number, data: EditProjectInput) {
    try {
      const existingProject = await db.project.findUnique({
        where: { id },
        include: { translations: true },
      });

      if (!existingProject) {
        throw new Error("NOT_FOUND");
      }

      // Resim alanını güncelleme
      if (data.image) {
        await db.project.update({
          where: { id },
          data: { image: data.image },
        });
      }

      for (const translation of data.translations) {
        if (translation.id) {
          const existingTranslation = existingProject.translations.find(
            (t) => t.id === translation.id
          );

          if (existingTranslation) {
            await db.projectTranslation.update({
              where: { id: translation.id },
              data: {
                title: translation.title,
                description: translation.description,
              },
            });
          } else {
            await db.projectTranslation.create({
              data: {
                projectId: id,
                language: translation.language,
                title: translation.title,
                description: translation.description,
              },
            });
          }
        } else {
          await db.projectTranslation.create({
            data: {
              projectId: id,
              language: translation.language,
              title: translation.title,
              description: translation.description,
            },
          });
        }
      }

      for (const existingTranslation of existingProject.translations) {
        if (!data.translations.some((t) => t.id === existingTranslation.id)) {
          await db.projectTranslation.delete({
            where: { id: existingTranslation.id },
          });
        }
      }

      const updatedProject = await db.project.findUnique({
        where: { id },
        include: { translations: true },
      });

      if (!updatedProject) {
        throw new Error("NOT_FOUND");
      }

      return {
        id: updatedProject.id,
        image: updatedProject.image,
        translations: updatedProject.translations.map((translation) => ({
          language: translation.language,
          title: translation.title,
          description: translation.description,
        })),
      };
    } catch (error) {
      if ((error as { code: string }).code === "P2025") {
        throw new Error("NOT_FOUND");
      }
      if ((error as { message: string }).message === "NOT_FOUND") {
        throw new Error("NOT_FOUND");
      }
      throw new Error("Failed to update project");
    }
  }
