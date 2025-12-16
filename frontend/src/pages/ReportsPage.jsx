import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      {/* REPORT OPTIONS */}
      <div className="max-w-4xl mx-auto px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/dashboard/reports/current-inventory")}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-600 transition shadow-md"
          >
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Current Inventory Report</span>
          </button>

          <button
            onClick={() => navigate("/dashboard/reports/customized")}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-600 transition shadow-md"
          >
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customized Report</span>
          </button>

          <button
            onClick={() => navigate("/dashboard/reports/low-stock")}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-600 transition shadow-md"
          >
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Low stock Report</span>
          </button>

        <button
            onClick={() => navigate("/dashboard/reports/spending")}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-600 transition shadow-md"
          >
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Spending Report</span>
          </button>
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-10 mb-8">
        <button
          className="px-8 py-2 bg-blue-200 dark:bg-blue-700 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 shadow transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
