import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";

export default function CurrentInventoryReportPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const navigate = useNavigate();

  // Load current inventory
  useEffect(() => {
    setLoading(true);
    API.get("/inventory/")
      .then((res) => {
        setInventory(res.data);
      })
      .catch((err) => {
        console.error("Error loading inventory:", err);
        setInventory([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    if (inventory.length === 0) {
      alert("No data to download");
      return;
    }

    // CSV Headers
    const headers = [
      "Item ID",
      "Item Name",
      "Part Number",
      "Description",
      "Current Quantity",
      "Minimum Count",
      "Unit",
      "Manufacturer",
      "Type",
      "Test Area",
      "Project Name",
      "Life Cycle"
    ];

    // CSV Rows
    const rows = inventory.map((item) => [
      item.item_id || "",
      item.item_name || "",
      item.item_part_number || "",
      item.item_description || "",
      item.item_current_quantity || 0,
      item.item_min_count || 0,
      item.item_unit || "",
      item.item_manufacturer || "",
      item.item_type || "",
      item.test_area || "",
      item.project_name || "",
      item.item_life_cycle || ""
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `current_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>


      {/* SUMMARY AND DOWNLOAD BUTTON */}
      <div className="max-w-6xl mx-auto px-8 mb-6 flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-700">
          {loading ? "Loading..." : `Total Items: ${inventory.length}`}
        </div>
        <button
          onClick={downloadCSV}
          disabled={loading || inventory.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Download CSV
        </button>
      </div>

      {/* INVENTORY TABLE */}
      <div className="max-w-6xl mx-auto px-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : inventory.length === 0 ? (
            <p className="text-gray-500">No inventory items found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Part Number</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Current Quantity</th>
                    <th className="p-3 text-left">Min Count</th>
                    <th className="p-3 text-left">Unit</th>
                    <th className="p-3 text-left">Manufacturer</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Test Area</th>
                    <th className="p-3 text-left">Project Name</th>
                    <th className="p-3 text-left">Life Cycle</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr 
                      key={item.item_id} 
                      onClick={() => setSelectedItemId(item.item_id)}
                      className={`border-b cursor-pointer transition-colors ${
                        selectedItemId === item.item_id 
                          ? "bg-blue-100 hover:bg-blue-200" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-3">{item.item_id}</td>
                      <td className={`p-3 font-medium ${selectedItemId === item.item_id ? "text-blue-700 font-bold" : ""}`}>{item.item_name}</td>
                      <td className="p-3">{item.item_part_number || "N/A"}</td>
                      <td className="p-3 max-w-xs">{item.item_description || "N/A"}</td>
                      <td className="p-3 font-semibold">{item.item_current_quantity}</td>
                      <td className="p-3">{item.item_min_count}</td>
                      <td className="p-3">{item.item_unit || "N/A"}</td>
                      <td className="p-3">{item.item_manufacturer || "N/A"}</td>
                      <td className="p-3">{item.item_type || "N/A"}</td>
                      <td className="p-3">{item.test_area || "N/A"}</td>
                      <td className="p-3">{item.project_name || "N/A"}</td>
                      <td className="p-3">{item.item_life_cycle || "N/A"}</td>
                    </tr>
                  ))}
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
          onClick={() => navigate("/dashboard/reports")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

