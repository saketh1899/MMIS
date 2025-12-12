// src/pages/RestockAddNewPage.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockAddNewPage() {
  const navigate = useNavigate();
  const [accessLevel, setAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load access level from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAccessLevel(payload.role);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
    setLoading(false);
  }, []);

  // Check if user is admin
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (accessLevel !== "admin") {
    return <AccessDenied feature="the Restock feature" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Add New Stock</h1>
      </div>

      <p className="text-center font-semibold text-gray-700 mb-6 text-lg">
        Select what you want to add
      </p>

      {/* OPTIONS GRID */}
      <div className="max-w-4xl mx-auto px-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* New Inventory Card */}
          <div
            onClick={() => navigate("/dashboard/restock/project/add-new-stock")}
            className="border p-8 text-center rounded-xl bg-white cursor-pointer 
                       hover:bg-blue-100 hover:shadow-lg transition-all shadow-md"
          >
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">New Inventory</h2>
            <p className="text-gray-600">Add a new inventory item</p>
          </div>

          {/* New Fixtures Card */}
          <div
            onClick={() => navigate("/dashboard/restock/project/add-new-fixture")}
            className="border p-8 text-center rounded-xl bg-white cursor-pointer 
                       hover:bg-blue-100 hover:shadow-lg transition-all shadow-md"
          >
            <div className="text-5xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">New Fixtures</h2>
            <p className="text-gray-600">Add a new fixture</p>
          </div>
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-12 mb-8">
        <button
          className="px-8 py-2 bg-blue-200 rounded hover:bg-blue-300 shadow"
          onClick={() => navigate("/dashboard/restock/project")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

