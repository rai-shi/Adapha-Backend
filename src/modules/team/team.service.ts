import {
    FilterOptions,
    manageData,
    PaginationOptions,
    SortingOptions,
  } from "../../utils/data.util";
  import { db } from "../../utils/prisma";
  import { 
    TeamMemberInput,
    EditTeamMemberInput,
 } from "./team.schema";

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
        console.log("Translations:", data.translations);

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
