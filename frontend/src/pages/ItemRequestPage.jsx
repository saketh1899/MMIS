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
  if (!item) return <h2 className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Request Item</h1>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* ITEM CARD */}
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-6 mb-8 transition-colors">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">{item.item_name}</h2>
          <p className="text-gray-700 dark:text-gray-300"><strong>Part Number:</strong> {item.item_part_number}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Description:</strong> {item.item_description}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Manufacturer:</strong> {item.item_manufacturer}</p>

          <p className="mt-3 font-bold text-green-600 dark:text-green-400 text-lg">
            Current Quantity: {item.item_current_quantity}
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-4 transition-colors">

          <label className="font-semibold text-gray-700 dark:text-gray-300">Fixture</label>
          <select
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded transition-colors"
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

          <label className="font-semibold text-gray-700 dark:text-gray-300">Quantity</label>
          <input
            type="number"
            min="1"
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded transition-colors"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />

          <label className="font-semibold text-gray-700 dark:text-gray-300">Remarks (Optional)</label>
          <input
            type="text"
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded transition-colors"
            placeholder="Any notes..."
          />

          <div className="flex justify-center gap-6 mt-6">
            <button
              className="px-6 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

            <button
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
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
