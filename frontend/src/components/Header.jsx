// src/components/Header.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Header({ showMMIS = true }) {
  const [userName, setUserName] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
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

  // Fetch employee name from backend
  useEffect(() => {
    if (!employeeId) return;

    API.get(`/employees/${employeeId}`)
      .then((res) => {
        setUserName(res.data.employee_name || "");
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
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow"
        >
          Sign out
        </button>
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-semibold text-gray-800 text-lg">
          {getInitials(userName)}
        </div>
      </div>
    </header>
  );
}

