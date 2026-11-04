import { randomUUID } from "node:crypto";
import { Router } from "express";
import {
  normalizeCreateTicketInput,
  TICKET_STATUSES,
  type CreateTicketInput,
  type Ticket,
  type TicketFilter,
  type TicketStatus,
} from "@shared/ticket";
import * as ticketRepository from "../repositories/ticketRepository";

const router = Router();
const ticketFilters: readonly TicketFilter[] = [...TICKET_STATUSES, "all"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTicketStatus(value: string): value is TicketStatus {
  return TICKET_STATUSES.some((status) => status === value);
}

function isTicketFilter(value: string): value is TicketFilter {
  return ticketFilters.some((filter) => filter === value);
}

router.get("/", async (request, response) => {
  const status = request.query.status;

  if (
    status !== undefined &&
    (typeof status !== "string" || !isTicketFilter(status))
  ) {
    response.status(400).json({
      error: `status must be one of: ${ticketFilters.join(", ")}`,
    });
    return;
  }

  const tickets = await ticketRepository.findAll();
  response.json(
    status === undefined || status === "all"
      ? tickets
      : tickets.filter((ticket) => ticket.status === status),
  );
});

router.post("/", async (request, response) => {
  const body: unknown = request.body;

  if (!isRecord(body)) {
    response.status(400).json({ error: "Request body must be an object" });
    return;
  }

  if (typeof body.title !== "string") {
    response
      .status(400)
      .json({ error: "title is required and must be a string" });
    return;
  }

  const title = body.title.trim();
  if (title.length < 3 || title.length > 100) {
    response.status(400).json({
      error: "title must be between 3 and 100 characters after trimming",
    });
    return;
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    response.status(400).json({ error: "description must be a string" });
    return;
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : undefined;
  if (description !== undefined && description.length > 1000) {
    response.status(400).json({
      error: "description must not exceed 1000 characters after trimming",
    });
    return;
  }

  const input: CreateTicketInput = { title, description };
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: randomUUID(),
    ...normalizeCreateTicketInput(input),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  response.status(201).json(await ticketRepository.create(ticket));
});

router.get("/:id", async (request, response) => {
  const ticket = await ticketRepository.findById(request.params.id);

  if (!ticket) {
    response.status(404).json({ error: "Ticket not found" });
    return;
  }

  response.json(ticket);
});

router.patch("/:id", async (request, response) => {
  const body: unknown = request.body;

  if (!isRecord(body) || typeof body.status !== "string") {
    response.status(400).json({
      error: `status must be one of: ${TICKET_STATUSES.join(", ")}`,
    });
    return;
  }

  if (!isTicketStatus(body.status)) {
    response.status(400).json({
      error: `status must be one of: ${TICKET_STATUSES.join(", ")}`,
    });
    return;
  }

  const ticket = await ticketRepository.update(request.params.id, {
    status: body.status,
    updatedAt: new Date().toISOString(),
  });

  if (!ticket) {
    response.status(404).json({ error: "Ticket not found" });
    return;
  }

  response.json(ticket);
});

export default router;
