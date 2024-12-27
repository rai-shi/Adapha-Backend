import { FastifyInstance, FastifyRequest } from "fastify";
import { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";
import {
    FilterOptions,
    PaginationOptions,
    SortingOptions,
  } from "../../utils/data.util";
  import { 
    getAllTeamMembersHandler,
    getTeamMemberByIdHandler,
    createTeamMemberHandler,
    updateTeamMemberHandler,
    deleteTeamMemberHandler,
 } from "./team.controller";
  import { 
    getAllTeamMembersResponseSchema,
    getTeamMemberByIdResponseSchema,
    createTeamMemberResponseSchema,
    createTeamMemberSchema,
    editTeamMemberSchema,

 } from "./team.schema";


 // teamRoutes API routes
export async function teamRoutes(server: FastifyInstance){

    // create team member (POST)
    server.withTypeProvider<FastifyZodOpenApiTypeProvider>().post(
        "/create",
        {
            preHandler: [server.authenticate],
            schema: {
                tags: ["Team"],
                body: createTeamMemberSchema,
                response: {
                    201: createTeamMemberResponseSchema
                }
            },
        },
        createTeamMemberHandler
    );

    // get team member with an ID (GET)
    server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
        "/:id", 
        {
            schema: {
                tags: ["Team"],
                response: {
                    200: getTeamMemberByIdResponseSchema,
                },
            },
        },
        getTeamMemberByIdHandler
    );

    // get all team members as a list (GET)
    server.withTypeProvider<FastifyZodOpenApiTypeProvider>().get(
        "/", 
        {
            schema: {
                tags: ["Team"],
                response: {
                    200: getAllTeamMembersResponseSchema,
                },
            },
        },
        getAllTeamMembersHandler
    );

    // update team member (PUT)
    server.withTypeProvider<FastifyZodOpenApiTypeProvider>().put(
        "/:id",
        {
            schema: {
                preHandler: [server.authenticate],
                tags: ["Team"],
                body: editTeamMemberSchema,
                response: {
                    201: createTeamMemberResponseSchema,
                },
            },
        },
        updateTeamMemberHandler
    )

    // delete team member (DELETE)
    server.withTypeProvider<FastifyZodOpenApiTypeProvider>().delete(
        "/:id",
        {
            schema: {
                preHandler: [server.authenticate],
                tags: ["Team"],
            },
        },
        deleteTeamMemberHandler
    )
}

export async function turkishTeamRoutes(server: FastifyInstance){
    
}

export async function englishTeamRoutes(server: FastifyInstance){
    
}