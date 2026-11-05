import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { TICKET_STATUSES, type TicketStatus } from "@shared/ticket";
import { StatusBadge, statusLabels } from "../components/StatusBadge";
import { useTicketStore } from "../stores/ticketStore";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "long",
  timeStyle: "short",
});

export function RequestDetailsPage() {
  const { id } = useParams();
  const currentTicket = useTicketStore((state) => state.currentTicket);
  const isLoading = useTicketStore((state) => state.isLoading);
  const error = useTicketStore((state) => state.error);
  const fetchTicketById = useTicketStore((state) => state.fetchTicketById);
  const updateTicketStatus = useTicketStore((state) => state.updateTicketStatus);
  const ticket = currentTicket?.id === id ? currentTicket : null;

  useEffect(() => {
    if (id) {
      void fetchTicketById(id).catch(() => {
        // The store keeps the error for this page to display.
      });
    }
  }, [fetchTicketById, id]);

  if (!id) {
    return <p className="notice notice-error">Не указан номер заявки.</p>;
  }

  return (
    <section className="details-page">
      <Link className="back-link" to="/requests">
        <span aria-hidden="true">←</span> Все заявки
      </Link>

      {isLoading && !ticket ? (
        <div className="state-card" role="status">
          <span className="spinner" aria-hidden="true" />
          <p>Загружаем заявку…</p>
        </div>
      ) : error && !ticket ? (
        <div className="state-card">
          <div className="notice notice-error" role="alert">
            <div>
              <strong>Не удалось загрузить заявку</strong>
              <p>{error}</p>
            </div>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                void fetchTicketById(id).catch(() => {
                  // The store keeps the error for this page to display.
                });
              }}
            >
              Повторить
            </button>
          </div>
          <Link className="button button-secondary" to="/requests">
            К списку заявок
          </Link>
        </div>
      ) : ticket ? (
        <>
          <div className="page-heading details-heading">
            <div>
              <p className="eyebrow">Заявка</p>
              <h1>{ticket.title}</h1>
              <div className="details-status">
                <StatusBadge status={ticket.status} />
                {isLoading && <span className="muted-text">Сохраняем…</span>}
              </div>
            </div>
          </div>

          {error && (
            <div className="notice notice-error" role="alert">
              {error}
            </div>
          )}

          <div className="details-grid">
            <article className="details-card">
              <h2>Описание</h2>
              <p className="details-description">
                {ticket.description || "Описание не добавлено."}
              </p>
            </article>

            <aside className="details-card details-sidebar">
              <h2>Сведения</h2>
              <label className="form-field">
                <span>Статус</span>
                <select
                  value={ticket.status}
                  disabled={isLoading}
                  onChange={(event) => {
                    const status = event.target.value as TicketStatus;
                    void updateTicketStatus(id, status).catch(() => {
                      // The store keeps the error for this page to display.
                    });
                  }}
                >
                  {TICKET_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <dl className="metadata-list">
                <div>
                  <dt>Создана</dt>
                  <dd>{dateFormatter.format(new Date(ticket.createdAt))}</dd>
                </div>
                <div>
                  <dt>Обновлена</dt>
                  <dd>{dateFormatter.format(new Date(ticket.updatedAt))}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}
