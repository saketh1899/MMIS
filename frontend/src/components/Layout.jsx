// src/components/Layout.jsx
import { Link, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout({ children }) {
  const location = useLocation();

  // Check if a path is active
  const isActive = (path) => {
    if (path === "/dashboard") {
      // For dashboard, only match exact path
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    // For other paths, check if current path starts with the link path
    return location.pathname.startsWith(path);
  };

  // Navigation items
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/dashboard/request", label: "Request" },
    { path: "/dashboard/return", label: "Return" },
    { path: "/dashboard/restock", label: "Restock" },
    { path: "/dashboard/alerts", label: "Low Stock Alerts" },
    { path: "/dashboard/reports", label: "Reports" },
    { path: "/dashboard/activity", label: "Activity History" },
  ];

  return (
    <div className="flex h-screen bg-transparent transition-colors">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md p-6 space-y-4 transition-colors">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">MMIS</h1>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-blue-600 dark:bg-blue-700 text-white font-semibold shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <Header showMMIS={false} />

        {/* Page Body */}
        <main className="p-6 overflow-auto bg-transparent transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
