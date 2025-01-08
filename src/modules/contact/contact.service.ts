import {
  FilterOptions,
  manageData,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { deleteFromS3 } from "../../utils/image";
import { db } from "../../utils/prisma";
import { ContactInput } from "./contact.schema";

export async function createContact(data: ContactInput) {
  try {
    const newContact = await db.contact.create({
      data: {
        ...data,
        createdAt: new Date(),
      },
    });

    return newContact;
  } catch (error) {
    throw new Error("Failed to create contact");
  }
}

export async function getContacts(
  query: PaginationOptions & SortingOptions & FilterOptions
) {
  try {
    const contacts = await db.contact.findMany();
    const { totalCount, data: paginatedContacts } = manageData(
      contacts,
      query,
      true
    );
    return { totalCount, data: paginatedContacts };
  } catch (error) {
    throw new Error("Failed to get contacts");
  }
}

export async function getContactById(id: number) {
  try {
    const contact = await db.contact.findUnique({
      where: {
        id,
      },
    });
    return contact;
  } catch (error) {
    throw new Error("Failed to get contact");
  }
}

export async function deleteContact(id: number) {
  try {
    const contact = await db.contact.delete({
      where: {
        id,
      },
    });

    if (contact.video) deleteFromS3(contact.video);

    return contact;
  } catch (error) {
    if ((error as { code: string }).code === "P2025") {
      throw new Error("NOT_FOUND");
    }

    throw new Error("Failed to delete contact");
  }
}
