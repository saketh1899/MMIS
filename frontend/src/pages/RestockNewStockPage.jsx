import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockNewStockPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const project = params.get("project");

  // Available options for dropdowns
  const projects = [
    "Common",
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

  const testAreas = [
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
    "TOOLS",
  ];

  const itemTypes = [
    "part",
    "tool",
  ];

  const [formData, setFormData] = useState({
    item_name: "",
    project_name: project || "",
    item_part_number: "",
    item_description: "",
    test_area: "",
    item_unit: "",
    item_current_quantity: "",
    item_unit_price: "",
    item_min_count: "",
    item_manufacturer: "",
    item_type: "",
    item_life_cycle: "",
    remarks: "",
  });
  const [employeeId, setEmployeeId] = useState(null);
  const [accessLevel, setAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load employee_id and access level
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setEmployeeId(payload.employee_id);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.item_name || !formData.item_current_quantity) {
      alert("Please fill in required fields (Item Name and Current Quantity)");
      return;
    }

    try {
      await API.post("/inventory/", {
        item_name: formData.item_name,
        project_name: formData.project_name,
        item_part_number: formData.item_part_number || null,
        item_description: formData.item_description || null,
        test_area: formData.test_area || null,
        item_unit: formData.item_unit || null,
        item_current_quantity: parseInt(formData.item_current_quantity),
        item_unit_price: formData.item_unit_price || null,
        item_min_count: parseInt(formData.item_min_count) || 0,
        item_manufacturer: formData.item_manufacturer || null,
        item_type: formData.item_type || null,
        item_life_cycle: parseInt(formData.item_life_cycle) || null,
        employee_id: employeeId,  // Include employee_id for activity history
      });

      alert("New stock item added successfully!");
      navigate("/dashboard/restock");
    } catch (err) {
      console.error(err);
      alert("Failed to add new stock item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">New Stock</h1>
      </div>

      <div className="max-w-5xl mx-auto px-8">
        {/* FORM */}
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-6 mb-8 transition-colors">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Project Name</label>
                <select
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                >
                  <option value="">Select Project Name</option>
                  {projects.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Part Number</label>
                <input
                  type="text"
                  name="item_part_number"
                  value={formData.item_part_number}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <input
                  type="text"
                  name="item_description"
                  value={formData.item_description}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Test Area</label>
                <select
                  name="test_area"
                  value={formData.test_area}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                >
                  <option value="">Select Test Area</option>
                  {testAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Unit</label>
                <input
                  type="text"
                  name="item_unit"
                  value={formData.item_unit}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                  placeholder="liters, lbs"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Current Quantity</label>
                <input
                  type="number"
                  name="item_current_quantity"
                  value={formData.item_current_quantity}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Unit Price</label>
                <input
                  type="text"
                  name="item_unit_price"
                  value={formData.item_unit_price}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                  placeholder="e.g., $10.50"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Minimum Count</label>
                <input
                  type="number"
                  name="item_min_count"
                  value={formData.item_min_count}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Manufacturer</label>
                <input
                  type="text"
                  name="item_manufacturer"
                  value={formData.item_manufacturer}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Type</label>
                <select
                  name="item_type"
                  value={formData.item_type}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                >
                  <option value="">Select Type</option>
                  {itemTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Life Cycle</label>
                <input
                  type="number"
                  name="item_life_cycle"
                  value={formData.item_life_cycle}
                  onChange={handleChange}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                />
              </div>
            </div>
          </div>

          {/* BOTTOM FIELD */}
          <div className="mt-6">
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Remarks (Optional)</label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
              placeholder="Any notes..."
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            className="px-8 py-2 bg-blue-200 dark:bg-blue-700 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 shadow transition-colors"
            onClick={() => navigate("/dashboard/restock/project/add-new")}
          >
            Back
          </button>

          <button
            className="px-8 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 shadow transition-colors"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

    </div>
  );
}

