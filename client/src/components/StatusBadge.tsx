import type { TicketStatus } from "@shared/ticket";

export const statusLabels: Record<TicketStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  closed: "Закрыта",
};

type StatusBadgeProps = {
  status: TicketStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
