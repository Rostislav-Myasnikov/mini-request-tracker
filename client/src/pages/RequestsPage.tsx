import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { TicketFilter } from "@shared/ticket";
import { StatusBadge } from "../components/StatusBadge";
import { useTicketStore } from "../stores/ticketStore";

const filterOptions: { value: TicketFilter; label: string }[] = [
  { value: "all", label: "Все заявки" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "closed", label: "Закрытые" },
];

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function RequestsPage() {
  const tickets = useTicketStore((state) => state.tickets);
  const selectedStatus = useTicketStore((state) => state.selectedStatus);
  const isLoading = useTicketStore((state) => state.isLoading);
  const error = useTicketStore((state) => state.error);
  const fetchTickets = useTicketStore((state) => state.fetchTickets);
  const setSelectedStatus = useTicketStore((state) => state.setSelectedStatus);

  useEffect(() => {
    void fetchTickets().catch(() => {
      // The store keeps the error for this page to display.
    });
  }, [fetchTickets]);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Рабочее пространство</p>
          <h1>Заявки</h1>
          <p className="page-description">
            Создавайте заявки и следите за их выполнением.
          </p>
        </div>
        <Link className="button button-primary desktop-create" to="/requests/new">
          <span aria-hidden="true">＋</span> Новая заявка
        </Link>
      </div>

      <div className="list-toolbar">
        <label className="filter-control">
          <span>Статус</span>
          <select
            value={selectedStatus}
            onChange={(event) => {
              const status = event.target.value as TicketFilter;
              void setSelectedStatus(status).catch(() => {
                // The store keeps the error for this page to display.
              });
            }}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <span className="result-count">
          {tickets.length} {tickets.length === 1 ? "заявка" : "заявок"}
        </span>
      </div>

      {error && (
        <div className="notice notice-error" role="alert">
          <div>
            <strong>Не удалось загрузить заявки</strong>
            <p>{error}</p>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              void fetchTickets().catch(() => {
                // The store keeps the error for this page to display.
              });
            }}
          >
            Повторить
          </button>
        </div>
      )}

      {isLoading && tickets.length === 0 ? (
        <div className="state-card" role="status">
          <span className="spinner" aria-hidden="true" />
          <p>Загружаем заявки…</p>
        </div>
      ) : !error && tickets.length === 0 ? (
        <div className="state-card empty-state">
          <div className="empty-icon" aria-hidden="true">
            ✓
          </div>
          <h2>{selectedStatus === "all" ? "Заявок пока нет" : "Заявки не найдены"}</h2>
          <p>
            {selectedStatus === "all"
              ? "Создайте первую заявку, чтобы начать работу."
              : "Попробуйте выбрать другой статус или создайте новую заявку."}
          </p>
          <Link className="button button-primary" to="/requests/new">
            Создать заявку
          </Link>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <Link
              className="ticket-card"
              key={ticket.id}
              to={`/requests/${encodeURIComponent(ticket.id)}`}
            >
              <div className="ticket-card-content">
                <div className="ticket-card-title-row">
                  <h2>{ticket.title}</h2>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="ticket-description">
                  {ticket.description || "Описание не добавлено"}
                </p>
                <span className="ticket-date">
                  Обновлена {dateFormatter.format(new Date(ticket.updatedAt))}
                </span>
              </div>
              <span className="ticket-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mobile-create">
        <Link className="button button-primary" to="/requests/new">
          Создать заявку
        </Link>
      </div>
    </section>
  );
}
