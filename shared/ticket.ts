export const TICKET_STATUSES = ["new", "in_progress", "closed"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type TicketFilter = TicketStatus | "all";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateTicketInput = {
  title: string;
  description?: string;
};

export function normalizeCreateTicketInput(
  input: CreateTicketInput,
): CreateTicketInput & { description: string } {
  return {
    ...input,
    description: input.description ?? "",
  };
}

export type UpdateTicketStatusInput = {
  status: TicketStatus;
};
