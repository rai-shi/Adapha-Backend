import { FastifyReply, FastifyRequest } from "fastify";
import { verifyPassword } from "../../utils/hash";
import { CreateUserInput, LoginInput } from "./user.schema";
import { createUser, findUserByEmail, getUsers } from "./user.service";

export async function registerUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const existingUser = await findUserByEmail(body.email);
    if (existingUser) {
      return reply.status(400).send({
        message: "A user with this email already exists.",
      });
    }

    const user = await createUser(body);
    return reply.status(201).send(user);
  } catch (error) {
    reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;
  const user = await findUserByEmail(body.email);

  if (!user) {
    return reply.status(401).send({
      message: "Invalid email address. Try again!",
    });
  }

  const isValidPassword = verifyPassword({
    candidatePassword: body.password,
    salt: user.salt,
    hash: user.password,
  });

  if (!isValidPassword) {
    return reply.status(401).send({
      message: "Password is incorrect",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const accessToken = request.jwt.sign(payload, { expiresIn: "5m" });
  const refreshToken = request.jwt.sign(payload, {
    expiresIn: body.rememberMe ? "30d" : "1d",
  });

  reply.setCookie("refresh_token", refreshToken, {
    path: "/",
    maxAge: 24 * 60 * 60 * 1000 * (body.rememberMe ? 30 : 1),
    httpOnly: true,
    secure: true,
  });

  return { accessToken, email: user.email };
}

export async function refreshTokenHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const refreshToken = request.cookies.refresh_token;

  if (!refreshToken) {
    return reply.status(401).send({ message: "Refresh token required" });
  }

  try {
    const decoded = request.jwt.verify(refreshToken) as {
      id: string;
      email: string;
    };

    const newPayload = {
      id: decoded.id,
      email: decoded.email,
    };

    const EXPIRES_IN = 300; // 5 dakika
    const newAccessToken = request.jwt.sign(newPayload, {
      expiresIn: `${EXPIRES_IN}s`,
    });

    return { accessToken: newAccessToken };
  } catch (error) {
    return reply.status(401).send({ message: "Invalid refresh token" });
  }
}

export async function getUsersHandler() {
  const users = await getUsers();
  return users;
}

export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  reply.clearCookie("refresh_token");

  return reply.status(201).send({ message: "Logout successfully" });
}

export async function getUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = await findUserByEmail((request.user as { email: string }).email);

  if (!user) {
    return reply.status(404).send({
      message: "User not found",
    });
  }

  const { id, email } = user;

  return reply.send({ id, email });
}
