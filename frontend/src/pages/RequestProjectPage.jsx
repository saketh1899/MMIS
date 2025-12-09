// src/pages/RequestProjectPage.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequestProjectPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  //Load username from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.user_name || "");
    }
  }, []);

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

    return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP BAR */}
      <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate("/dashboard")}>MMIS</span>
        <span className="text-lg font-semibold text-gray-700">{userName}</span>
      </div>

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Request</h1>
      </div>

      <p className="text-center font-semibold text-gray-700 mb-6 text-lg">
        Select Project Name
      </p>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-4 gap-6 justify-center mx-auto max-w-5xl">
        {projects.map((p) => (
          <div
            key={p}
            onClick={() => navigate(`/dashboard/request/test-area?project=${p}`)}
            className="border p-8 text-center rounded-xl bg-white cursor-pointer 
                       hover:bg-blue-100 hover:shadow-lg transition-all shadow-md"
          >
            <span className="font-semibold text-gray-800 text-lg">{p}</span>
          </div>
        ))}
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