// src/components/Header.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Header({ showMMIS = true }) {
  const [userName, setUserName] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeDesignation, setEmployeeDesignation] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
    <header className="bg-white shadow p-4 flex justify-between items-center">
      {showMMIS && (
        <span 
          className="text-2xl font-bold text-blue-600 cursor-pointer" 
          onClick={() => navigate("/dashboard")}
        >
          MMIS
        </span>
      )}
      {!showMMIS && <div></div>}
      <div className="flex items-center gap-4">
        {/* Profile Avatar with Dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-800 text-lg cursor-pointer hover:bg-gray-400 transition-colors"
          >
            {getInitials(userName)}
          </div>
          
          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{employeeDesignation || "No designation"}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/dashboard/profile");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <span>👤</span>
                <span>View Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/dashboard/change-password");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <span>🔒</span>
                <span>Change Password</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
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

