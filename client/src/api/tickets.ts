import type {
  CreateTicketInput,
  Ticket,
  TicketFilter,
  TicketStatus,
} from "@shared/ticket";

const ticketsUrl = "/api/tickets";

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
  } catch {
    // Use the HTTP status when the server response is not JSON.
  }

  return `Request failed with status ${response.status}`;
}

async function requestTicket<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
}

export function getTickets(status?: TicketFilter): Promise<Ticket[]> {
  const query =
    status === undefined
      ? ""
      : `?${new URLSearchParams({ status }).toString()}`;
  return requestTicket<Ticket[]>(`${ticketsUrl}${query}`);
}

export function getTicketById(id: string): Promise<Ticket> {
  return requestTicket<Ticket>(`${ticketsUrl}/${encodeURIComponent(id)}`);
}

export function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return requestTicket<Ticket>(ticketsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  return requestTicket<Ticket>(`${ticketsUrl}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
