import {
  FilterOptions,
  manageData,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { deleteFromS3 } from "../../utils/image";
import { db } from "../../utils/prisma";
import { EditTeamMemberInput, TeamMemberInput } from "./team.schema";

export async function getAllTeamMembers(
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const teamMembers = await db.teamMember.findMany({
      include: {
        translations: true,
      },
    });

    const { totalCount, data: paginatedContacts } = manageData(
      teamMembers,
      query,
      true
    );

    return { totalCount, data: paginatedContacts };
  } catch (error) {
    throw new Error("Failed to fetch team members");
  }
}

export async function createTeamMember(data: TeamMemberInput) {
  try {
    const teamMember = await db.teamMember.create({
      data: {
        name: data.name, // Zorunlu alan
        surname: data.surname, // Zorunlu alan
        image: data.image, // Zorunlu alan
        translations: {
          create: data.translations, // Çeviriler
        },
      },
      include: { translations: true },
    });
    return teamMember;
  } catch (error) {
    console.error("Error creating team member:", error);
    throw new Error("Failed to create new team member");
  }
}

export async function getTeamMemberById(id: number) {
  try {
    const teamMember = await db.teamMember.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!teamMember) {
      throw new Error("NOT_FOUND");
    }
    return teamMember;
  } catch (error) {
    throw new Error("Failed to fetch team member");
  }
}

export async function deleteTeamMember(id: number) {
  try {
    await db.teamMemberTranslation.deleteMany({
      where: { teamMemberId: id },
    });

    const deletedNew = await db.teamMember.delete({
      where: { id },
    });

    await deleteFromS3(deletedNew.image);

    return deletedNew;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to delete team member");
  }
}

export async function updateTeamMember(id: number, data: EditTeamMemberInput) {
  try {
    const { translations, ...rest } = data;

    const existingTeamMember = await db.teamMember.findUnique({
      where: { id },
    });

    if (!existingTeamMember) {
      throw new Error("NOT_FOUND");
    }

    for (const translation of translations) {
      await db.teamMemberTranslation.update({
        where: { id: translation.id },
        data: translation,
      });
    }

    const updatedTeamMember = await db.teamMember.update({
      where: { id },
      data: {
        ...rest,
      },
      include: {
        translations: true,
      },
    });

    return updatedTeamMember;
  } catch (error) {
    const err = error as { message: string };
    if (err.message === "NOT_FOUND") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to update team member");
  }
}

export async function getTeamMembersByLanguage(
  language: "en" | "tr",
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const data = await db.teamMember.findMany({
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

    const dataResult = data.map((member) => ({
      id: member.id,
      name: member.name,
      surname: member.surname,
      image: member.image,
      title: member.translations[0].title,
      role: member.translations[0].role,
    }));

    const { totalCount, data: paginatedTeamMembers } = manageData(
      dataResult,
      query,
      true
    );

    return { totalCount, data: paginatedTeamMembers };
  } catch (error) {
    throw new Error("Failed to fetch team members");
  }
}
