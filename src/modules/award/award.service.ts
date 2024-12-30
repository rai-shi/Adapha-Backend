import {
    FilterOptions,
    manageData,
    PaginationOptions,
    SortingOptions,
  } from "../../utils/data.util";
  import { db } from "../../utils/prisma";
  import { AwardInput } from "./award.schema";
  
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
        include: {
          translations: true, 
        },
      });
  
      const { totalCount, data: paginatedAwards } = manageData(awards, query, true);
      return { totalCount, data: paginatedAwards };
    } catch (error) {
      throw new Error("Failed to get awards");
    }
  }
  
  export async function getAwardById(id: number) {
    try {
      const award = await db.award.findUnique({
        where: {
          id,
        },
        include: {
          translations: true, 
        },
      });
  
      return award;
    } catch (error) {
      throw new Error("Failed to get award");
    }
  }
  
  export async function deleteAward(id: number) {
    try {
      const award = await db.award.delete({
        where: {
          id,
        },
      });
      return award;
    } catch (error) {
      if ((error as { code: string }).code === "P2025") {
        throw new Error("NOT_FOUND");
      }
  
      throw new Error("Failed to delete award");
    }
  }
  