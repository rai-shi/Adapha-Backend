import { JWT } from "@fastify/jwt";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
    user?: {
      email: string;
      [key: string]: any;
    };
  }

  interface FastifyInstance {
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      email: string;
      [key: string]: any;
    };
  }
}
