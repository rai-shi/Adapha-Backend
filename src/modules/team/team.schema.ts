import { title } from "process";
import { z } from "zod";

export const TeamMemberTranslationSchema = z.
    object({

    })


export const getAllTeamMembersResponseSchema = z
    .object({
        totalCount: z.number().describe("Total number of team members"),
        data: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                surname: z.string(),
                image: z.string(), 
                translations: z.array(
                    TeamMemberTranslationSchema.extend({
                        title: z.string(),
                        role: z.string(),
                        teamMemberId: z.number(),
                    })
                ),
            })
        ).describe("List of team members"),
    }).openapi({
        description: "Get all team members response",
    });

export const getTeamMemberByIdResponseSchema = z
    .object({
        
    }) 

export const createTeamMemberResponseSchema = z
    .object({
        
    }) 

export const createTeamMemberSchema = z
    .object({
        
    }) 

export const editTeamMemberSchema = z
    .object({
        
    }) 



