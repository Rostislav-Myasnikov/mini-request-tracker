import { TICKET_STATUSES, type TicketStatus } from "@shared/ticket";

const statuses: readonly TicketStatus[] = TICKET_STATUSES;

export function App() {
  return (
    <main className="scaffold">
      <h1>Мини-трекер заявок</h1>
      <p>Каркас клиента подключён к общему модулю типов.</p>
      <p>Статусы: {statuses.join(", ")}</p>
    </main>
  );
}
