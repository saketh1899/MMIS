// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequestPage from "./pages/RequestPage";
import ReturnPage from "./pages/ReturnPage";
import RestockPage from "./pages/RestockPage";
import ReportsPage from "./pages/ReportsPage";
import AlertsPage from "./pages/AlertsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ActivityPage from "./pages/ActivityPage";
import RequestProjectPage from "./pages/RequestProjectPage";
import RequestTestAreaPage from "./pages/RequestTestAreaPage";
import ItemRequestPage from "./pages/ItemRequestPage";
import ItemReturnPage from "./pages/ItemReturnPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        

        {/* ADMIN + USER */}
        <Route
          path="/dashboard/"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/request"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <RequestProjectPage/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/request/test-area"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <RequestTestAreaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/request/search"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <RequestPage/>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/dashboard/request/item/:item_id" 
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]} >
              <ItemRequestPage /> 
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/return/"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <ReturnPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/return/item/:transaction_id"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <ItemReturnPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/alerts"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ONLY */}
        <Route
          path="/dashboard/restock"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/activity"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <ActivityPage />
            </ProtectedRoute>
          }
/>
      </Routes>
    </BrowserRouter>
  );
}
