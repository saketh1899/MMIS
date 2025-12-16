// src/components/Header.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useTheme } from "../contexts/ThemeContext";

export default function Header({ showMMIS = true }) {
  const [userName, setUserName] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeDesignation, setEmployeeDesignation] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Load employee info from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setEmployeeId(payload.employee_id);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  // Fetch employee name and designation from backend
  useEffect(() => {
    if (!employeeId) return;

    API.get(`/employees/${employeeId}`)
      .then((res) => {
        setUserName(res.data.employee_name || "");
        setEmployeeDesignation(res.data.employee_designation || "");
      })
      .catch((err) => console.error("Error loading employee:", err));
  }, [employeeId]);

  // Get user initials (first letter of first name + first letter of last name)
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center transition-colors">
      {showMMIS && (
        <span 
          className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer" 
          onClick={() => navigate("/dashboard")}
        >
          MMIS
        </span>
      )}
      {!showMMIS && <div></div>}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
        {/* Profile Avatar with Dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center font-semibold text-gray-800 dark:text-gray-200 text-lg cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            {getInitials(userName)}
          </div>
          
          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{employeeDesignation || "No designation"}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/dashboard/profile");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <span>👤</span>
                <span>View Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/dashboard/change-password");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <span>🔒</span>
                <span>Change Password</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <span>🚪</span>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

