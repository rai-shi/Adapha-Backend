import { db } from "../../utils/prisma";
import { EditCategoryInput, NewCategoryInput } from "./new-category.schema";

export async function createNewCategory(data: NewCategoryInput) {
  try {
    const newCategory = await db.newCategory.create({
      data: {
        translations: {
          create: data.translations,
        },
      },
      include: { translations: true },
    });

    return newCategory;
  } catch (error) {
    throw new Error("Failed to create new category");
  }
}

export async function getAllNewCategories() {
  try {
    const categories = await db.newCategory.findMany({
      include: {
        translations: true,
      },
    });
    return categories;
  } catch (error) {
    throw new Error("Failed to fetch new categories");
  }
}

export async function getNewCategoriesByLanguage(language: "en" | "tr") {
  try {
    const categories = await db.newCategory.findMany({
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
    return categories.map((category) => ({
      id: category.id,
      title: category.translations[0].title,
    }));
  } catch (error) {
    throw new Error("Failed to fetch new categories");
  }
}

export async function getNewCategoryById(id: number) {
  try {
    const category = await db.newCategory.findUnique({
      where: { id },
      include: { translations: true },
    });
    return category;
  } catch (error) {
    throw new Error("Failed to fetch new category");
  }
}

export async function getNewCategoryByIdAndLanguage(
  id: number,
  language: "en" | "tr"
) {
  try {
    const category = await db.newCategory.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
      },
    });

    if (!category || category.translations.length === 0) {
      throw new Error("NOT_FOUND");
    }

    return {
      id: category.id,
      title: category.translations[0].title,
    };
  } catch (error) {
    const err = error as { message: string };

    if (err.message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to fetch new category by ID and language");
  }
}

export async function deleteNewCategory(id: number) {
  try {
    await db.newCategoryTranslation.deleteMany({
      where: { categoryId: id },
    });

    const category = await db.newCategory.delete({
      where: { id },
    });

    return category;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to delete category and its translations");
  }
}

export async function updateNewCategory(id: number, data: EditCategoryInput) {
  try {
    const updatedCategory = await db.newCategory.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!updatedCategory) {
      throw new Error("NOT_FOUND");
    }

    for (const translation of data.translations) {
      if (translation.id) {
        const existingTranslation = updatedCategory.translations.find(
          (t) => t.id === translation.id
        );

        if (existingTranslation) {
          await db.newCategoryTranslation.update({
            where: { id: translation.id },
            data: {
              title: translation.title,
            },
          });
        } else {
          await db.newCategoryTranslation.create({
            data: {
              categoryId: id,
              language: translation.language,
              title: translation.title,
            },
          });
        }
      } else {
        await db.newCategoryTranslation.create({
          data: {
            categoryId: id,
            language: translation.language,
            title: translation.title,
          },
        });
      }
    }

    for (const existingTranslation of updatedCategory.translations) {
      if (!data.translations.some((t) => t.id === existingTranslation.id)) {
        await db.newCategoryTranslation.delete({
          where: { id: existingTranslation.id },
        });
      }
    }

    const updatedCategoryData = await db.newCategory.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!updatedCategoryData) {
      throw new Error("NOT_FOUND");
    }

    const result = {
      id: updatedCategoryData.id,
      translations: updatedCategoryData.translations.map((translation) => ({
        language: translation.language,
        title: translation.title,
      })),
    };

    return result;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    if ((error as { message: string }).message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to update category");
  }
}
