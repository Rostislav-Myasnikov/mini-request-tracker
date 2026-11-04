import { randomUUID } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TICKET_STATUSES, type Ticket } from "@shared/ticket";

type TicketUpdates = Partial<Omit<Ticket, "id">>;

const ticketsFilePath = fileURLToPath(
  new URL("../../data/tickets.json", import.meta.url),
);
const ticketsDirectory = path.dirname(ticketsFilePath);

let mutationQueue: Promise<void> = Promise.resolve();

function isTicket(value: unknown): value is Ticket {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const ticket = value as Record<string, unknown>;

  return (
    typeof ticket.id === "string" &&
    typeof ticket.title === "string" &&
    typeof ticket.description === "string" &&
    TICKET_STATUSES.some((status) => status === ticket.status) &&
    typeof ticket.createdAt === "string" &&
    typeof ticket.updatedAt === "string"
  );
}

async function readTickets(): Promise<Ticket[]> {
  let contents: string;

  try {
    contents = await readFile(ticketsFilePath, "utf8");
  } catch (error) {
    throw new Error(`Unable to read tickets from ${ticketsFilePath}`, {
      cause: error,
    });
  }

  let data: unknown;

  try {
    data = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Invalid JSON in ${ticketsFilePath}`, { cause: error });
  }

  if (!Array.isArray(data) || !data.every(isTicket)) {
    throw new Error(`Invalid ticket data in ${ticketsFilePath}`);
  }

  return data;
}

async function writeTickets(tickets: Ticket[]): Promise<void> {
  const temporaryFilePath = path.join(
    ticketsDirectory,
    `tickets.${randomUUID()}.tmp`,
  );

  try {
    await writeFile(temporaryFilePath, `${JSON.stringify(tickets, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryFilePath, ticketsFilePath);
  } catch (error) {
    try {
      await unlink(temporaryFilePath);
    } catch (cleanupError) {
      if (
        typeof cleanupError !== "object" ||
        cleanupError === null ||
        !("code" in cleanupError) ||
        cleanupError.code !== "ENOENT"
      ) {
        throw new AggregateError(
          [error, cleanupError],
          `Unable to write tickets to ${ticketsFilePath} or clean up its temporary file`,
        );
      }
    }

    throw new Error(`Unable to write tickets to ${ticketsFilePath}`, {
      cause: error,
    });
  }
}

function serializeMutation<T>(mutation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(mutation);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function findAll(): Promise<Ticket[]> {
  return readTickets();
}

export async function findById(id: string): Promise<Ticket | null> {
  const tickets = await readTickets();
  return tickets.find((ticket) => ticket.id === id) ?? null;
}

export function create(ticket: Ticket): Promise<Ticket> {
  const ticketToCreate = { ...ticket };

  return serializeMutation(async () => {
    const tickets = await readTickets();
    tickets.push(ticketToCreate);
    await writeTickets(tickets);
    return ticketToCreate;
  });
}

export function update(
  id: string,
  updates: TicketUpdates,
): Promise<Ticket | null> {
  const updatesToApply = { ...updates };

  return serializeMutation(async () => {
    const tickets = await readTickets();
    const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);

    if (ticketIndex === -1) {
      return null;
    }

    const updatedTicket = { ...tickets[ticketIndex], ...updatesToApply, id };
    tickets[ticketIndex] = updatedTicket;
    await writeTickets(tickets);
    return updatedTicket;
  });
}
