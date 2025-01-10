import {
  FilterOptions,
  manageData,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { deleteFromS3 } from "../../utils/image";
import { db } from "../../utils/prisma";
import { NewInput, UpdateNewInput } from "./new.schema";

export async function createNew(data: NewInput) {
  try {
    const categoryExists = await db.newCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw new Error(`CATEGORY_NOT_FOUND`);
    }

    const newRecord = await db.new.create({
      data: {
        categoryId: data.categoryId,
        image: data.image,
        featured: false,
        author: data.author,
        translations: {
          create: data.translations,
        },
      },
      include: {
        translations: true,
      },
    });

    return newRecord;
  } catch (error) {
    const err = error as { message: string; code: string };

    if (err.message === "CATEGORY_NOT_FOUND") {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    if (err.code === "P2002") {
      throw new Error("DUPLICATE_RECORD");
    }

    throw new Error("Failed to create new");
  }
}

export async function getAllNews(
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const news = await db.new.findMany({
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
      },
    });

    const { totalCount, data: paginatedNews } = manageData(news, query, true);

    return { totalCount, data: paginatedNews };
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Failed to fetch news");
  }
}

export async function getAllFeaturedNews() {
  try {
    const news = await db.new.findMany({
      where: { featured: true },
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
      },
    });

    return news;
  } catch (error) {
    throw new Error("Failed to fetch featured news");
  }
}

export async function getAllNonFeaturedNews() {
  try {
    const news = await db.new.findMany({
      where: { featured: false },
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
      },
    });

    return news;
  } catch (error) {
    throw new Error("Failed to fetch non featured news");
  }
}

export async function getAllFeaturedNewsByLanguage(language: "en" | "tr") {
  try {
    const news = await db.new.findMany({
      where: { featured: true },
      include: {
        translations: {
          where: { language },
        },
        category: {
          include: {
            translations: {
              where: { language },
            },
          },
        },
      },
    });

    const dataResult = news.map((news) => {
      const { translations, category, ...rest } = news;

      const result = {
        ...rest,
        language: translations[0].language,
        title: translations[0].title,
        content: translations[0].content,
        description: translations[0].description,
        slug: translations[0].slug,
        categoryName: category?.translations[0]?.title,
      };

      return result;
    });

    return dataResult;
  } catch (error) {
    throw new Error("Failed to fetch featured news");
  }
}

export async function getNewById(id: number) {
  try {
    const newRecord = await db.new.findUnique({
      where: { id },
      include: { translations: true, category: true },
    });

    if (!newRecord) {
      throw new Error("NOT_FOUND");
    }

    return newRecord;
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to fetch new");
  }
}

export async function getAllNewsByLangauge(
  language: "en" | "tr",
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const news = await db.new.findMany({
      include: {
        translations: {
          where: { language },
        },
        category: {
          include: {
            translations: {
              where: { language },
            },
          },
        },
      },
    });

    const dataResult = news.map((news) => {
      const { translations, category, ...rest } = news;

      const result = {
        ...rest,
        language: translations[0].language,
        title: translations[0].title,
        content: translations[0].content,
        description: translations[0].description,
        slug: translations[0].slug,
        categoryName: category?.translations[0]?.title,
      };

      return result;
    });

    const { totalCount, data: paginatedNews } = manageData(
      dataResult,
      query,
      true
    );

    return { totalCount, data: paginatedNews };
  } catch (error) {
    throw new Error("Failed to fetch news");
  }
}

export async function getNewByIdAndLanguage(id: number, language: "en" | "tr") {
  try {
    const newRecord = await db.new.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
        category: {
          include: {
            translations: {
              where: { language },
            },
          },
        },
      },
    });

    if (!newRecord) {
      throw new Error("NOT_FOUND");
    }

    const { translations, category, ...rest } = newRecord;

    const result = {
      ...rest,
      language: translations[0].language,
      title: translations[0].title,
      content: translations[0].content,
      description: translations[0].description,
      slug: translations[0].slug,
      categoryName: category?.translations[0]?.title,
    };

    return result;
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to fetch news");
  }
}

export async function deleteNew(id: number) {
  try {
    await db.newTranslation.deleteMany({
      where: { newId: id },
    });

    const deletedNew = await db.new.delete({
      where: { id },
    });

    await deleteFromS3(deletedNew.image);

    return deletedNew;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to delete new");
  }
}

export async function updateNew(id: number, data: UpdateNewInput) {
  try {
    const { translations, ...rest } = data;

    const existingNew = await db.new.findUnique({
      where: { id },
    });

    if (!existingNew) {
      throw new Error("NOT_FOUND");
    }

    const categoryExists = await db.newCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw new Error(`CATEGORY_NOT_FOUND`);
    }

    const existingTranslations = await db.newTranslation.findMany({
      where: { newId: id },
    });

    for (const translation of existingTranslations) {
      const translationExists = translations.find(
        (t) => t.id === translation.id
      );

      if (!translationExists) {
        await db.newTranslation.delete({
          where: { id: translation.id },
        });
      }
    }

    for (const translation of translations) {
      if (translation.id) {
        await db.newTranslation.update({
          where: { id: translation.id },
          data: translation,
        });
      } else {
        await db.newTranslation.create({
          data: {
            ...translation,
            newId: id,
          },
        });
      }
    }

    const updatedNew = await db.new.update({
      where: { id },
      data: {
        ...rest,
      },
      include: {
        translations: true,
      },
    });

    return updatedNew;
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }

    if (err.message === "CATEGORY_NOT_FOUND") {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    throw new Error("Failed to update new record");
  }
}

export async function updateFeaturedNew(id: number) {
  try {
    const currentNew = await db.new.findUnique({
      where: { id },
    });

    const newUpdated = await db.new.update({
      where: { id },
      data: { featured: !currentNew?.featured },
    });

    return newUpdated;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to update new");
  }
}

export async function getRelatedNews(
  id: number,
  language: "en" | "tr",
  count: number
) {
  const news = await db.new.findMany({
    where: { NOT: { id } },
    take: count,
    include: {
      translations: { where: { language } },
      category: { include: { translations: { where: { language } } } },
    },
  });

  const dataResult = news.map((item) => {
    const { translations, category, ...rest } = item;
    return {
      ...rest,
      language: translations[0].language,
      title: translations[0].title,
      content: translations[0].content,
      description: translations[0].description,
      slug: translations[0].slug,
      categoryName: category?.translations[0]?.title,
    };
  });

  return dataResult;
}
