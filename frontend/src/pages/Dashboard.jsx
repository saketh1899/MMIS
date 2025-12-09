// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import API from "../api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [employeeId, setEmployeeId] = useState(null);

  // Extract employee_id from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("TOKEN PAYLOAD:", payload);

      setEmployeeId(payload.employee_id);
    }
  }, []);

  // Fetch employee name from backend
  useEffect(() => {
    if (!employeeId) return;

    API.get(`/employees/${employeeId}`)
      .then((res) => {
        setUserName(res.data.employee_name);
      })
      .catch((err) => console.error("Error loading employee:", err));
  }, [employeeId]);

  return (
    <Layout>
      {/* Welcome Header */}
      <div className="bg-blue-600 text-white rounded-xl p-8 shadow mb-10">
        <h1 className="text-4xl font-bold tracking-wide">MMIS</h1>
        <p className="text-lg mt-3">
          Welcome back, <span className="font-semibold">{userName}</span> 👋
        </p>
        <p className="opacity-80 mt-1">
          Manage machine maintenance inventory with ease.
        </p>
      </div>

      {/* Dashboard Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-lg font-bold">Inventory Items</h3>
          <p className="text-4xl font-semibold mt-2 text-blue-600">532</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-lg font-bold">Low Stock Alerts</h3>
          <p className="text-4xl font-semibold mt-2 text-red-500">12</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="text-lg font-bold">Weekly Reports</h3>
          <p className="text-4xl font-semibold mt-2 text-green-600">7</p>
        </div>

      </div>
    </Layout>
  );
}
