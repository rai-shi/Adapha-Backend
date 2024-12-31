// AWARD SERVICE

import {
  FilterOptions,
  manageData,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { db } from "../../utils/prisma";
import { AwardInput, EditAwardInput } from "./award.schema";

export async function createAward(data: AwardInput) {
  try {
    const newAward = await db.award.create({
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
    return newAward;
  } catch (error) {
    throw new Error("Failed to create award");
  }
}

export async function getAwards(
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const awards = await db.award.findMany({
      include: { translations: true },
    });

    const { totalCount, data: paginatedAwards } = manageData(awards, query, true);
    return { totalCount, data: paginatedAwards };
  } catch (error) {
    throw new Error("Failed to fetch awards");
  }
}

export async function getAwardsByLanguage(
  language: "en" | "tr",
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const awards = await db.award.findMany({
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

    const dataResult = awards.map((award) => ({
      id: award.id,
      title: award.translations[0].title,
      description: award.translations[0].description,
    }));

    const { totalCount, data: paginatedAwards } = manageData(
      dataResult,
      query,
      true
    );

    return { totalCount, data: paginatedAwards };
  } catch (error) {
    throw new Error("Failed to fetch awards by language");
  }
}

export async function getAwardById(id: number) {
  try {
    const award = await db.award.findUnique({
      where: { id },
      include: { translations: true },
    });
    return award;
  } catch (error) {
    throw new Error("Failed to fetch award");
  }
}

export async function getAwardByIdAndLanguage(
  id: number,
  language: "en" | "tr"
) {
  try {
    const award = await db.award.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
      },
    });

    if (!award || award.translations.length === 0) {
      throw new Error("NOT_FOUND");
    }

    return {
      id: award.id,
      title: award.translations[0].title,
      description: award.translations[0].description,
    };
  } catch (error) {
    if ((error as { message: string }).message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }
    throw new Error("Failed to fetch award by ID and language");
  }
}

export async function deleteAward(id: number) {
  try {
    await db.awardTranslation.deleteMany({
      where: { awardId: id },
    });

    const award = await db.award.delete({
      where: { id },
    });

    return award;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }
    throw new Error("Failed to delete award");
  }
}

export async function updateAward(id: number, data: EditAwardInput) {
  try {
    const existingAward = await db.award.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existingAward) {
      throw new Error("NOT_FOUND");
    }

    for (const translation of data.translations) {
      if (translation.id) {
        const existingTranslation = existingAward.translations.find(
          (t) => t.id === translation.id
        );

        if (existingTranslation) {
          await db.awardTranslation.update({
            where: { id: translation.id },
            data: {
              title: translation.title,
              description: translation.description,
            },
          });
        } else {
          await db.awardTranslation.create({
            data: {
              awardId: id,
              language: translation.language,
              title: translation.title,
              description: translation.description,
            },
          });
        }
      } else {
        await db.awardTranslation.create({
          data: {
            awardId: id,
            language: translation.language,
            title: translation.title,
            description: translation.description,
          },
        });
      }
    }

    for (const existingTranslation of existingAward.translations) {
      if (!data.translations.some((t) => t.id === existingTranslation.id)) {
        await db.awardTranslation.delete({
          where: { id: existingTranslation.id },
        });
      }
    }

    const updatedAward = await db.award.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!updatedAward) {
      throw new Error("NOT_FOUND");
    }

    return {
      id: updatedAward.id,
      translations: updatedAward.translations.map((translation) => ({
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
    throw new Error("Failed to update award");
  }
}
