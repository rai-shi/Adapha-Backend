import { FastifyReply, FastifyRequest } from "fastify";
import {
  FilterOptions,
  PaginationOptions,
  SortingOptions,
} from "../../utils/data.util";
import { ContactInput } from "./contact.schema";
import {
  createContact,
  deleteContact,
  getContactById,
  getContacts,
} from "./contact.service";

export async function createContactHandler(
  request: FastifyRequest<{
    Body: ContactInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const newContact = await createContact(body);
    return reply.status(201).send(newContact);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getContactsHandler(
  request: FastifyRequest<{
    Querystring: PaginationOptions & SortingOptions & FilterOptions;
  }>,
  reply: FastifyReply
) {
  try {
    const { totalCount, data } = await getContacts(request.query);

    return reply.send({ totalCount, data });
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function getContactByIdHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    const contact = await getContactById(id);
    if (!contact) {
      return reply.status(404).send({ message: "Contact not found" });
    }
    return reply.send(contact);
  } catch (error) {
    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}

export async function deleteContactHandler(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    await deleteContact(id);
    return reply.send({ message: "Contact deleted successfully" });
  } catch (error) {
    const err = error as Error;

    if (err.message === "NOT_FOUND") {
      return reply.status(404).send({ message: "Contact not found" });
    }

    return reply.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
}
