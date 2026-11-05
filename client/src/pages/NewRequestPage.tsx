import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CreateTicketInput } from "@shared/ticket";
import { useTicketStore } from "../stores/ticketStore";

export function NewRequestPage() {
  const navigate = useNavigate();
  const createTicket = useTicketStore((state) => state.createTicket);
  const isLoading = useTicketStore((state) => state.isLoading);
  const storeError = useTicketStore((state) => state.error);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
      setValidationError("Название должно содержать от 3 до 100 символов.");
      return;
    }

    if (trimmedDescription.length > 1000) {
      setValidationError("Описание не должно превышать 1000 символов.");
      return;
    }

    const input: CreateTicketInput = {
      title: trimmedTitle,
      description: trimmedDescription,
    };

    try {
      const ticket = await createTicket(input);
      navigate(`/requests/${encodeURIComponent(ticket.id)}`);
    } catch {
      // The store exposes the request error to the form.
    }
  }

  return (
    <section className="form-page">
      <Link className="back-link" to="/requests">
        <span aria-hidden="true">←</span> Все заявки
      </Link>
      <div className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Новая заявка</p>
          <h1>Создать заявку</h1>
          <p className="page-description">
            Заполните основные сведения. Статус будет установлен автоматически.
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={(event) => void handleSubmit(event)}>
        {(validationError || storeError) && (
          <div className="notice notice-error form-error" role="alert">
            {validationError ?? storeError}
          </div>
        )}

        <label className="form-field">
          <span>
            Название <span className="required-mark">*</span>
          </span>
          <input
            autoFocus
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Кратко опишите проблему или задачу"
            aria-invalid={Boolean(validationError && title.trim().length < 3)}
            aria-describedby="title-hint"
          />
          <small id="title-hint">От 3 до 100 символов после удаления пробелов по краям.</small>
        </label>

        <label className="form-field">
          <span>Описание</span>
          <textarea
            name="description"
            rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Добавьте подробности, если это необходимо"
            aria-invalid={Boolean(validationError && description.trim().length > 1000)}
            aria-describedby="description-hint"
          />
          <small id="description-hint">
            Необязательно. До 1000 символов после удаления пробелов по краям.
          </small>
        </label>

        <div className="form-actions">
          <Link className="button button-secondary" to="/requests">
            Отмена
          </Link>
          <button className="button button-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Создаём…" : "Создать заявку"}
          </button>
        </div>
      </form>
    </section>
  );
}
