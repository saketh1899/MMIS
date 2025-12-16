import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockTestAreaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [accessLevel, setAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  const project = params.get("project");

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
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
      <p className="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>;
  }

  if (accessLevel !== "admin") {
    return <AccessDenied feature="the Restock feature" />;
  }

  // Regular test areas
  const regularTestAreas = [
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
    "TOOLS",
  ];

  // Test areas for Common project
  const commonTestAreas = [
    "Hi-Lo",
    "Flying Probe",
    "Development",
  ];

  // Select test areas based on project
  const testAreas = project === "Common" ? commonTestAreas : regularTestAreas;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Restock</h1>
      </div>

      {/* SUBTITLE */}
      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-2 text-lg">
        Project: <span className="text-blue-600 dark:text-blue-400">{project}</span>
      </p>

      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-6 text-lg">
        Select Test Area
      </p>

      {/* TEST AREA GRID */}
      <div className="grid grid-cols-3 gap-6 justify-center mx-auto max-w-4xl px-8">
        {testAreas.map((area) => (
          <div
            key={area}
            onClick={() =>
              navigate(`/dashboard/restock/items?project=${project}&test_area=${area}`)
            }
            className="border dark:border-gray-700 p-8 text-center rounded-xl bg-white dark:bg-gray-800 cursor-pointer 
                       hover:bg-blue-100 dark:hover:bg-gray-700 hover:shadow-lg transition-all shadow-md"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{area}</span>
          </div>
        ))}
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-12 mb-8">
        <button
          className="px-8 py-2 bg-blue-200 dark:bg-blue-700 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 shadow transition-colors"
          onClick={() => navigate("/dashboard/restock")}
        >
          Back
        </button>
      </div>

    </div>
  );
}

