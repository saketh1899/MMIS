// src/components/Layout.jsx
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">MMIS</h1>

        <nav className="space-y-3">
          <Link className="block text-gray-700 hover:text-blue-600" to="/dashboard">
            Dashboard
          </Link>
          <Link className="block text-gray-700 hover:text-blue-600" to="/dashboard/request">
            Request
          </Link>
          <Link className="block text-gray-700 hover:text-blue-600" to="/dashboard/return">
            Return
          </Link>
          <Link className="block text-gray-700 hover:text-blue-600" to="/dashboard/restock">
            Restock
          </Link>
          <Link className="block text-gray-700 hover:text-blue-600" to="/dashboard/alerts">
            Low Stock Alerts
          </Link>
          <Link className="block text-gray-700 hover:text-blue-600" to="/dashboard/reports">
            Reports
          </Link>
          <Link className="block text-gray-700 hover:text-blue-600" to="/dashboard/activity">
            Activity History
          </Link>

        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <header className="bg-white shadow p-4 flex justify-end">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        {/* Page Body */}
        <main className="p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
