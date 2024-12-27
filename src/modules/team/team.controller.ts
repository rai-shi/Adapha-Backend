import fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";

import { TeamMemberInput, EditTeamMemberInput } from "./team.schema";
import { 
    getAllTeamMembers,
    createTeamMember,
 } from "./team.service";

// import { TeamMember } from "@prisma/client";


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
export async function createTeamMemberHandler(
    request: FastifyRequest<{ Body: TeamMemberInput; }>,
    reply: FastifyReply
) {
    const body = request.body;

    try {
        const teamMember = await createTeamMember(body);
        return reply.status(201).send(teamMember);        
    } catch (error) {
        return reply.status(500).send({
            message: "Internal Server Error",
            error: error,
        });
    }   
}

// update team member 
export async function updateTeamMemberHandler() {
    
}

// delete team member
export async function deleteTeamMemberHandler() {
    
}

