import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";

export default function ItemRequestPage() {
  const { item_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Read project & test_area from URL at the top
  const queryParams = new URLSearchParams(location.search);
  const project = queryParams.get("project");
  const test_area = queryParams.get("test_area");

  // Hooks MUST be here
  const [item, setItem] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [fixture, setFixture] = useState("");
  const [quantity, setQuantity] = useState("");

  // Load item details
  useEffect(() => {
    API.get(`/inventory/${item_id}`)
      .then((res) => setItem(res.data))
      .catch((err) => console.error("Error loading item:", err));
  }, [item_id]);

  // Load fixtures — Safe even if project or test_area is null
  useEffect(() => {
    API.get(`/fixtures/filter?project=${project || ""}&test_area=${test_area || ""}`)
      .then((res) => setFixtures(res.data))
      .catch((err) => console.error("Error loading fixtures:", err));
  }, [project, test_area]);

  const submitRequest = async () => {
    if (!fixture || !quantity) {
      alert("Select fixture and quantity");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));

      await API.post("/inventory/request", {
        employee_id: payload.employee_id,
        item_id,
        fixture_id: Number(fixture),
        quantity: Number(quantity),
        test_area,
        project_name: project,
        transaction_type: "Request",
      });

      alert("Request submitted!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    }
  };

  // MUST COME AFTER HOOKS
  if (!item) return <h2 className="text-center mt-10">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Request Item</h1>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* ITEM CARD */}
        <div className="bg-white border rounded-xl shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">{item.item_name}</h2>
          <p><strong>Part Number:</strong> {item.item_part_number}</p>
          <p><strong>Description:</strong> {item.item_description}</p>
          <p><strong>Manufacturer:</strong> {item.item_manufacturer}</p>

          <p className="mt-3 font-bold text-green-600 text-lg">
            Current Quantity: {item.item_current_quantity}
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white border rounded-xl shadow p-6 flex flex-col gap-4">

          <label className="font-semibold">Fixture</label>
          <select
            className="border p-2 rounded"
            value={fixture}
            onChange={(e) => setFixture(e.target.value)}
          >
            <option value="">Select Fixture</option>
            {fixtures.map((fx) => (
              <option key={fx.fixture_id} value={fx.fixture_id}>
                {fx.fixture_name}
              </option>
            ))}
          </select>

          <label className="font-semibold">Quantity</label>
          <input
            type="number"
            min="1"
            className="border p-2 rounded"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />

          <label className="font-semibold">Remarks (Optional)</label>
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Any notes..."
          />

          <div className="flex justify-center gap-6 mt-6">
            <button
              className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

            <button
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={submitRequest}
            >
              Submit Request
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
