import {
    FilterOptions,
    manageData,
    PaginationOptions,
    SortingOptions,
  } from "../../utils/data.util";
  import { db } from "../../utils/prisma";
  import {  } from "./team.schema";

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

