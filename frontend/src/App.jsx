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
import RestockProjectPage from "./pages/RestockProjectPage";
import RestockTestAreaPage from "./pages/RestockTestAreaPage";
import RestockItemPage from "./pages/RestockItemPage";
import RestockEditItemPage from "./pages/RestockEditItemPage";
import RestockNewStockPage from "./pages/RestockNewStockPage";
import RestockAddNewPage from "./pages/RestockAddNewPage";
import RestockNewFixturePage from "./pages/RestockNewFixturePage";
import RestockEditFixturePage from "./pages/RestockEditFixturePage";
import CurrentInventoryReportPage from "./pages/CurrentInventoryReportPage";
import LowStockReportPage from "./pages/LowStockReportPage";
import CustomizedReportPage from "./pages/CustomizedReportPage";
import SpendingReportPage from "./pages/SpendingReportPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ProfilePage from "./pages/ProfilePage";
import TransferItemPage from "./pages/TransferItemPage";

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
          path="/dashboard/restock/project"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockProjectPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/restock/test-area"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockTestAreaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/restock/items"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockItemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/restock/item/:item_id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockEditItemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/restock/project/add-new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockAddNewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/restock/project/add-new-stock"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockNewStockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/restock/project/add-new-fixture"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockNewFixturePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/restock/fixture/:fixture_id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RestockEditFixturePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reports/current-inventory"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <CurrentInventoryReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reports/low-stock"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <LowStockReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/transfer"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <TransferItemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reports/customized"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <CustomizedReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reports/spending"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <SpendingReportPage />
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

        <Route
          path="/dashboard/change-password"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
