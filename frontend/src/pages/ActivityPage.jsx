// src/pages/ActivityPage.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function ActivityPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userName = payload.employee_name;
    setUserName(userName);

    API.get(`/transactions/all`)
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, []);


  const formatQuantity = (type,qty) => {
    if(type.toLowerCase() === "request") {
      return <span className="text-red-600 font-semibold">-{qty}</span>;
  }
  if(type.toLowerCase() === "return") {
      return <span className="text-green-600 font-semibold">+{qty}</span>;
  }
  return <span className="text-blue-600 font-semibold">+{qty}</span>;
};

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP WHITE BAR */}
      <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center">
        <span 
          className="text-2xl font-bold text-blue-600 cursor-pointer" 
          onClick={() => navigate("/dashboard")}
        >
          MMIS
        </span>
        <span className="text-lg font-semibold text-gray-700">{userName}</span>
      </div>

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Recent Activity History</h1>
      </div>

      {/* MAIN TABLE */}
      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Fixture</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {history.map((row) => (
                <tr key={row.transaction_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{row.employee_name}</td>
                  <td className="p-3">{row.item_name}</td>
                  <td className="p-3 max-w-xs truncate">{row.item_description}</td>
                  <td className="p-3">{row.fixture_name}</td>
                  <td className="p-3">{formatQuantity(row.transaction_type, row.quantity_used)}</td>
                  <td className="p-3">{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-10 mb-6">
        <button
          className="px-8 py-2 bg-gray-300 rounded hover:bg-gray-400 shadow"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>
    </div>
  );
}