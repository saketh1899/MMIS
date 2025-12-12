// src/pages/RestockProjectPage.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockProjectPage() {
  const navigate = useNavigate();
  const [accessLevel, setAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  //Load access level from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Token stores access level as "role" field
        setAccessLevel(payload.role);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
    setLoading(false);
  }, []);

  // Check if user is admin
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>;
  }

  if (accessLevel !== "admin") {
    return <AccessDenied feature="the Restock feature" />;
  }

  const projects = [
    "Astoria",
    "Athena",
    "Turin",
    "Bondi Beach",
    "Zebra Beach",
    "Mandolin Beach",
    "Gulp",
    "Xena",
    "Agora",
    "Humu Beach",
  ];

  // Filter projects based on search input
  const filteredProjects = projects.filter((project) =>
    project.toLowerCase().includes(searchInput.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Restock</h1>
      </div>

      <p className="text-center font-semibold text-gray-700 mb-6 text-lg">
        Select Project Name
      </p>

      {/* SEARCH AND ADD SECTION */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Project Names"
            className="w-full p-3 border rounded shadow-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button
          onClick={() => navigate("/dashboard/restock/project/add-new")}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
        >
          Add New Stock
        </button>
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-4 gap-6 justify-center mx-auto max-w-5xl px-8">
        {filteredProjects.length === 0 ? (
          <div className="col-span-4 text-center text-gray-500 py-8">
            <p>No projects found matching "{searchInput}"</p>
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div
              key={p}
              onClick={() => navigate(`/dashboard/restock/test-area?project=${p}`)}
              className="border p-8 text-center rounded-xl bg-white cursor-pointer 
                         hover:bg-blue-100 hover:shadow-lg transition-all shadow-md"
            >
              <span className="font-semibold text-gray-800 text-lg">{p}</span>
            </div>
          ))
        )}
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-12 mb-8">
        <button
          className="px-8 py-2 bg-blue-200 rounded hover:bg-blue-300 shadow"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

