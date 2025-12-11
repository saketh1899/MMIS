// src/pages/RequestProjectPage.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";

export default function RequestProjectPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

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
        <h1 className="text-3xl font-bold">Request</h1>
      </div>

      <p className="text-center font-semibold text-gray-700 mb-6 text-lg">
        Select Project Name
      </p>

      {/* SEARCH BOX */}
      <div className="max-w-5xl mx-auto mb-6 px-8">
        <input
          type="text"
          placeholder="Project Names"
          className="w-full p-3 border rounded shadow-sm"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
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
              onClick={() => navigate(`/dashboard/request/test-area?project=${p}`)}
              className="border p-8 text-center rounded-xl bg-white cursor-pointer 
                         hover:bg-blue-100 hover:shadow-lg transition-all shadow-md"
            >
              <span className="font-semibold text-gray-800 text-lg">{p}</span>
            </div>
          ))
        )}
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-12">
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