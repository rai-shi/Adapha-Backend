import { hashPassword, verifyPassword } from "../../utils/hash";
import { db } from "../../utils/prisma";
import { CreateUserInput } from "./user.schema";

export async function createUser(input: CreateUserInput) {
  const { password, ...rest } = input;

  const { hash, salt } = hashPassword(password);

  const user = await db.user.create({
    data: { ...rest, salt, password: hash },
  });

  return user;
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getUsers() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
    },
  });
}

export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string
) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const isPasswordValid = verifyPassword({
    candidatePassword: oldPassword,
    salt: user.salt,
    hash: user.password,
  });

  if (!isPasswordValid) {
    throw new Error("OLD_PASSWORD_INVALID");
  }

  const { hash, salt } = hashPassword(newPassword);

  await db.user.update({
    where: { email },
    data: {
      password: hash,
      salt,
    },
  });

  return { message: "Password changed successfully" };
}
