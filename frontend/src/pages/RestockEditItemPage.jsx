import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockEditItemPage() {
  const { item_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Read project & test_area from URL
  const queryParams = new URLSearchParams(location.search);
  const project = queryParams.get("project");
  const test_area = queryParams.get("test_area");

  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({
    item_id: "",
    item_name: "",
    item_part_number: "",
    item_description: "",
    test_area: "",
    project_name: "",
    item_unit: "",
    item_min_count: "",
    item_manufacturer: "",
    item_type: "",
    item_life_cycle: "",
    item_current_quantity: "",
    quantity_to_add: "", // New field for quantity being added
    remarks: "",
  });
  const [employeeId, setEmployeeId] = useState(null);
  const [accessLevel, setAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
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

  // Load item details
  useEffect(() => {
    if (!item_id) return;
    
    API.get(`/inventory/${item_id}`)
      .then((res) => {
        const itemData = res.data;
        setItem(itemData);
        setFormData({
          item_id: itemData.item_id || "",
          item_name: itemData.item_name || "",
          item_part_number: itemData.item_part_number || "",
          item_description: itemData.item_description || "",
          test_area: itemData.test_area || "",
          project_name: itemData.project_name || "",
          item_unit: itemData.item_unit || "",
          item_min_count: itemData.item_min_count || "",
          item_manufacturer: itemData.item_manufacturer || "",
          item_type: itemData.item_type || "",
          item_life_cycle: itemData.item_life_cycle || "",
          item_current_quantity: itemData.item_current_quantity || "",
          quantity_to_add: "", // Initialize empty
          remarks: "",
        });
      })
      .catch((err) => console.error("Error loading item:", err));
  }, [item_id]);

  // NOW WE CAN DO CONDITIONAL RETURNS AFTER ALL HOOKS
  // Check if user is admin
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
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

  const handleRestock = async () => {
    if (!formData.quantity_to_add || parseFloat(formData.quantity_to_add) <= 0) {
      alert("Please enter a valid quantity to add (must be greater than 0)");
      return;
    }

    try {
      const quantityToAdd = parseFloat(formData.quantity_to_add);

      await API.post("/inventory/restock", {
        item_id: parseInt(item_id),
        quantity: quantityToAdd,
        remarks: formData.remarks || "",
        employee_id: employeeId,
      });

      alert("Item restocked successfully!");
      navigate(`/dashboard/restock/items?project=${project}&test_area=${test_area}`);
    } catch (err) {
      console.error(err);
      alert("Failed to restock item: " + (err.response?.data?.detail || err.message));
    }
  };

  if (!item) return <h2 className="text-center mt-10">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Restock</h1>
      </div>

      <div className="max-w-5xl mx-auto px-8">
        {/* FORM */}
        <div className="bg-white border rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Item ID</label>
                <input
                  type="text"
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Part Number</label>
                <input
                  type="text"
                  name="item_part_number"
                  value={formData.item_part_number}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Description</label>
                <input
                  type="text"
                  name="item_description"
                  value={formData.item_description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Test Area</label>
                <input
                  type="text"
                  name="test_area"
                  value={formData.test_area}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Project Name</label>
                <input
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Unit</label>
                <input
                  type="text"
                  name="item_unit"
                  value={formData.item_unit}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  placeholder="liters, lbs"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Minimum Count</label>
                <input
                  type="number"
                  name="item_min_count"
                  value={formData.item_min_count}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Manufacturer</label>
                <input
                  type="text"
                  name="item_manufacturer"
                  value={formData.item_manufacturer}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Type</label>
                <input
                  type="text"
                  name="item_type"
                  value={formData.item_type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Life Cycle</label>
                <input
                  type="number"
                  name="item_life_cycle"
                  value={formData.item_life_cycle}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Current Quantity</label>
                <input
                  type="number"
                  name="item_current_quantity"
                  value={formData.item_current_quantity}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* BOTTOM FIELDS */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold">Adding Quantity</label>
              <input
                type="number"
                name="quantity_to_add"
                value={formData.quantity_to_add}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter quantity to add"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Remarks (Optional)</label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Any notes..."
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            className="px-8 py-2 bg-blue-200 rounded hover:bg-blue-300 shadow"
            onClick={() => navigate(`/dashboard/restock/items?project=${project}&test_area=${test_area}`)}
          >
            Back
          </button>

          <button
            className="px-8 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
            onClick={handleRestock}
          >
            Restock
          </button>
        </div>
      </div>

    </div>
  );
}

