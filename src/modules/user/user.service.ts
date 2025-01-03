import {
  FilterOptions,
  manageData,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
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

export async function getUsers(
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    const { totalCount, data: paginatedUsers } = manageData(users, query, true);
    return { totalCount, data: paginatedUsers };
  } catch (error) {
    throw new Error("Failed to get users");
  }
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

export async function deleteUser(id: number) {
  try {
    const users = await db.user.findMany();

    if (users.length === 1) {
      throw new Error("LAST_USER");
    }

    const user = await db.user.delete({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    if ((error as { message: string }).message === "LAST_USER") {
      throw new Error("LAST_USER");
    }

    throw new Error("Failed to delete user");
  }
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}
