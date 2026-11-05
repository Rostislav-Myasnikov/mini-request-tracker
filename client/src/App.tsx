import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { NewRequestPage } from "./pages/NewRequestPage";
import { RequestDetailsPage } from "./pages/RequestDetailsPage";
import { RequestsPage } from "./pages/RequestsPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/requests" replace />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/new" element={<NewRequestPage />} />
        <Route path="/requests/:id" element={<RequestDetailsPage />} />
        <Route path="*" element={<Navigate to="/requests" replace />} />
      </Route>
    </Routes>
  );
}
