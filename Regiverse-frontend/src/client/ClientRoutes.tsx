import { Routes, Route, Navigate } from "react-router-dom";
import ClientLayout from "./layouts/ClientLayout";
import { ClientEventProvider } from "./contexts/ClientEventContext";

import Dashboard from "./pages/admin-dashboard";
import ParticipantManagement from "./pages/participant-management";
import RegisteredList from "./pages/RegisteredList";
import UploadPage from "./pages/upload";

export default function ClientRoutes() {
  return (
    <ClientEventProvider>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Event-Aware Nested Routes */}
          <Route path="events/:eventId">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-delegate" element={<ParticipantManagement />} />
            <Route path="registered-list" element={<RegisteredList />} />
            <Route path="upload-page" element={<UploadPage />} />
          </Route>

          {/* Standard Client Routes (Backwards Compatible) */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-delegate" element={<ParticipantManagement />} />
          <Route path="registered-list" element={<RegisteredList />} />
          <Route path="upload-page" element={<UploadPage />} />
        </Route>
      </Routes>
    </ClientEventProvider>
  );
}
