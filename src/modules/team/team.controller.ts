import fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";

import {  } from "./team.schema";
import { getAllTeamMembers } from "./team.service";


// get all team members
export async function getAllTeamMembersHandler(
    request: FastifyRequest<{
        Querystring: PaginationOptions & SortingOptions & FilterOptions;
      }>,
      reply: FastifyReply
) {
    try {
        const { totalCount, data } = await getAllTeamMembers(request.query);
        return reply.send({totalCount, data});

    } catch (error){
        reply.status(500).send({error: "Failed to fetch team members"});
    }
}

// get team member 
export async function getTeamMemberByIdHandler() {
    
}

// create new team member
export async function createNewTeamMemberHandler() {
    
}

// update team member 
export async function updateTeamMemberHandler() {
    
}

// delete team member
export async function deleteTeamMemberHandler() {
    
}
