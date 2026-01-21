import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";

export default function RequestTestAreaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const project = params.get("project");

  // Test areas
  const testAreas = [
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
    "TOOLS",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Request</h1>
      </div>

      {/* SUBTITLE */}
      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-2 text-lg">
        Project: <span className="text-blue-600 dark:text-blue-400">{project}</span>
      </p>

      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-6 text-lg">
        Select Test Area
      </p>

      {/* TEST AREA GRID */}
      <div className="grid grid-cols-3 gap-6 justify-center mx-auto max-w-4xl">
        {testAreas.map((area) => (
          <div
            key={area}
            onClick={() =>
              navigate(`/dashboard/request/search?project=${project}&test_area=${area}`)
            }
            className="border dark:border-gray-700 p-8 text-center rounded-xl bg-white dark:bg-gray-800 cursor-pointer 
                       hover:bg-blue-100 dark:hover:bg-gray-700 hover:shadow-lg transition-all shadow-md"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{area}</span>
          </div>
        ))}
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-12">
        <button
          className="px-8 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 shadow transition-colors"
          onClick={() => navigate("/dashboard/request")}
        >
          Back
        </button>
      </div>

    </div>
  );
}