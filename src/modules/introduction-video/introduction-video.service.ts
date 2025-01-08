import {
    FilterOptions,
    manageData,
    PaginationOptions,
    SortingOptions,
} from "../../utils/data.util";
import { deleteFromS3 } from "../../utils/image";
import { db } from "../../utils/prisma";
import {
    EditIntroductionVideoInput,
    IntroductionVideoInput,
} from "./introduction-video.schema";

export async function createIntroductionVideo(data: IntroductionVideoInput) {
  try {
    const newVideo = await db.introductionVideo.create({
      data: {
        image: data.image,
        url: data.url,
        translations: {
          create: data.translations.map((translation) => ({
            language: translation.language,
            title: translation.title,
          })),
        },
      },
      include: { translations: true },
    });
    return newVideo;
  } catch (error) {
    throw new Error("Failed to create introduction video");
  }
}

export async function getIntroductionVideos(
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const videos = await db.introductionVideo.findMany({
      include: { translations: true },
    });

    const { totalCount, data: paginatedVideos } = manageData(
      videos,
      query,
      true
    );
    return { totalCount, data: paginatedVideos };
  } catch (error) {
    throw new Error("Failed to get introduction videos");
  }
}

export async function getIntroductionVideoById(id: number) {
  try {
    const video = await db.introductionVideo.findUnique({
      where: { id },
      include: { translations: true },
    });

    return video;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get introduction video");
  }
}

export async function deleteIntroductionVideo(id: number) {
  try {
    await db.introductionVideoTranslation.deleteMany({
      where: { videoId: id },
    });

    const video = await db.introductionVideo.delete({
      where: { id },
    });

    await deleteFromS3(video.image);

    return video;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }
    throw new Error("Failed to delete introduction video");
  }
}

export async function updateIntroductionVideo(
  id: number,
  data: EditIntroductionVideoInput
) {
  try {
    const { translations, ...rest } = data;

    const existingVideo = await db.introductionVideo.findUnique({
      where: { id },
    });

    if (!existingVideo) {
      throw new Error("NOT_FOUND");
    }

    for (const translation of translations) {
      await db.introductionVideoTranslation.update({
        where: { id: translation.id },
        data: translation,
      });
    }

    const updatedVideo = await db.introductionVideo.update({
      where: { id },
      data: {
        ...rest,
      },
      include: {
        translations: true,
      },
    });

    return updatedVideo;
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to update introduction video");
  }
}

export async function getIntroductionVideosByLanguage(language: "en" | "tr") {
  try {
    const data = await db.introductionVideo.findMany({
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

    const dataResult = data.map((video) => ({
      id: video.id,
      image: video.image,
      url: video.url,
      title: video.translations[0].title,
    }));

    return dataResult;
  } catch (error) {
    throw new Error("Failed to fetch introduction videos");
  }
}
