import { NavLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-content">
          <NavLink className="brand" to="/requests">
            <span className="brand-mark" aria-hidden="true">
              R
            </span>
            <span>Трекер заявок</span>
          </NavLink>
          <NavLink className="button button-primary header-action" to="/requests/new">
            Создать заявку
          </NavLink>
        </div>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
      <footer className="site-footer">Мини-трекер заявок</footer>
    </div>
  );
}
