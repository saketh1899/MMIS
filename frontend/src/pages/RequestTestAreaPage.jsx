import { useNavigate, useSearchParams } from "react-router-dom";
import { use, useEffect, useState } from "react";

export default function RequestTestAreaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [userName, setUserName] = useState("");

  const project = params.get("project");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.user_name || "");
    }
  }, []);

  const testAreas = [
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
    "TOOLS",
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

      {/* SUBTITLE */}
      <p className="text-center font-semibold text-gray-700 mb-2 text-lg">
        Project: <span className="text-blue-600">{project}</span>
      </p>

      <p className="text-center font-semibold text-gray-700 mb-6 text-lg">
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
            className="border p-8 text-center rounded-xl bg-white cursor-pointer 
                       hover:bg-blue-100 hover:shadow-lg transition-all shadow-md"
          >
            <span className="font-semibold text-gray-800 text-lg">{area}</span>
          </div>
        ))}
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-12">
        <button
          className="px-8 py-2 bg-gray-300 rounded hover:bg-gray-400 shadow"
          onClick={() => navigate("/dashboard/request")}
        >
          Back
        </button>
      </div>

    </div>
  );
}