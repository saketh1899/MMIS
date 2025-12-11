import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";

export default function AlertsPage() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedTestArea, setSelectedTestArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const testAreas = [
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
  ];

  // Load low stock items
  useEffect(() => {
    setLoading(true);
    const endpoint = selectedTestArea 
      ? `/alerts/low-stock?test_area=${selectedTestArea}`
      : "/alerts/low-stock";
    
    API.get(endpoint)
      .then((res) => {
        setLowStockItems(res.data);
        setFilteredItems(res.data);
      })
      .catch((err) => {
        console.error("Error loading low stock items:", err);
        setLowStockItems([]);
        setFilteredItems([]);
      })
      .finally(() => setLoading(false));
  }, [selectedTestArea]);

  const handleTestAreaFilter = (testArea) => {
    setSelectedTestArea(testArea === selectedTestArea ? null : testArea);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Low Stock Alert</h1>
      </div>

      {/* TEST AREA FILTER BUTTONS */}
      <div className="flex gap-4 justify-center mb-8 px-8">
        {testAreas.map((area) => (
          <button
            key={area}
            onClick={() => handleTestAreaFilter(area)}
            className={`px-6 py-2 rounded shadow transition ${
              selectedTestArea === area
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* LOW STOCK ITEMS TABLE */}
      <div className="max-w-6xl mx-auto px-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-xl">No low stock items found</p>
              <p className="text-sm mt-2">
                {selectedTestArea 
                  ? `No items below minimum count in ${selectedTestArea}`
                  : "All items are above their minimum count"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Part Number</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Current Qty</th>
                    <th className="p-3 text-left">Min Count</th>
                    <th className="p-3 text-left">Unit</th>
                    <th className="p-3 text-left">Manufacturer</th>
                    <th className="p-3 text-left">Test Area</th>
                    <th className="p-3 text-left">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    // Calculate how critical the alert is (percentage of minimum)
                    const percentage = (item.item_current_quantity / item.item_min_count) * 100;
                    const isCritical = percentage < 50; // Less than 50% of minimum
                    
                    return (
                      <tr
                        key={item.item_id}
                        className={`border-b hover:bg-gray-50 ${
                          isCritical
                            ? "bg-orange-50 hover:bg-orange-100"
                            : "bg-yellow-50 hover:bg-yellow-100"
                        }`}
                      >
                        <td className="p-3">{item.item_id}</td>
                        <td className="p-3 font-medium">{item.item_name}</td>
                        <td className="p-3">{item.item_part_number || "N/A"}</td>
                        <td className="p-3 max-w-xs">{item.item_description || "N/A"}</td>
                        <td className="p-3">
                          <span className="text-red-600 font-bold">
                            {item.item_current_quantity}
                          </span>
                        </td>
                        <td className="p-3">{item.item_min_count}</td>
                        <td className="p-3">{item.item_unit || "N/A"}</td>
                        <td className="p-3">{item.item_manufacturer || "N/A"}</td>
                        <td className="p-3">{item.test_area || "N/A"}</td>
                        <td className="p-3">{item.project_name || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-10 mb-8">
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
