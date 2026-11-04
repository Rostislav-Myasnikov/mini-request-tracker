import { create } from "zustand";
import {
  createTicket as createTicketRequest,
  getTicketById,
  getTickets,
  updateTicketStatus as updateTicketStatusRequest,
} from "../api/tickets";
import type {
  CreateTicketInput,
  Ticket,
  TicketFilter,
  TicketStatus,
} from "@shared/ticket";

type TicketStore = {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  selectedStatus: TicketFilter;
  isLoading: boolean;
  error: string | null;
  fetchTickets: (status?: TicketFilter) => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  createTicket: (input: CreateTicketInput) => Promise<Ticket>;
  updateTicketStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  setSelectedStatus: (status: TicketFilter) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred";
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  currentTicket: null,
  selectedStatus: "all",
  isLoading: false,
  error: null,

  fetchTickets: async (status) => {
    const selectedStatus = status ?? get().selectedStatus;
    set({ isLoading: true, error: null });

    try {
      const tickets = await getTickets(selectedStatus);
      set({ tickets, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  fetchTicketById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const currentTicket = await getTicketById(id);
      set({ currentTicket, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  createTicket: async (input) => {
    set({ isLoading: true, error: null });

    try {
      const ticket = await createTicketRequest(input);
      const { selectedStatus, tickets } = get();
      set({
        tickets:
          selectedStatus === "all" || selectedStatus === ticket.status
            ? [...tickets, ticket]
            : tickets,
        currentTicket: ticket,
        isLoading: false,
      });
      return ticket;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  updateTicketStatus: async (id, status) => {
    set({ isLoading: true, error: null });

    try {
      const ticket = await updateTicketStatusRequest(id, status);
      const { selectedStatus, tickets, currentTicket } = get();
      const matchesFilter = selectedStatus === "all" || ticket.status === selectedStatus;
      const existingIndex = tickets.findIndex((item) => item.id === id);
      let updatedTickets = tickets;

      if (existingIndex !== -1 && matchesFilter) {
        updatedTickets = tickets.map((item) => (item.id === id ? ticket : item));
      } else if (existingIndex !== -1) {
        updatedTickets = tickets.filter((item) => item.id !== id);
      } else if (matchesFilter) {
        updatedTickets = [...tickets, ticket];
      }

      set({
        tickets: updatedTickets,
        currentTicket: currentTicket?.id === id ? ticket : currentTicket,
        isLoading: false,
      });
      return ticket;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  setSelectedStatus: async (status) => {
    set({ selectedStatus: status });
    await get().fetchTickets(status);
  },
}));
