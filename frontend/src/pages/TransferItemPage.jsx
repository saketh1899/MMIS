import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";

export default function TransferItemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sourceItemId = searchParams.get("source_item_id");
  const destItemId = searchParams.get("dest_item_id");
  
  const [sourceItem, setSourceItem] = useState(null);
  const [destItem, setDestItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState("");
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    loadData();
  }, [sourceItemId, destItemId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sourceRes, destRes, fixturesRes] = await Promise.all([
        API.get(`/inventory/${sourceItemId}`),
        API.get(`/inventory/${destItemId}`),
        API.get("/fixtures/")
      ]);
      
      setSourceItem(sourceRes.data);
      setDestItem(destRes.data);
      setFixtures(fixturesRes.data || []);
      
      if (fixturesRes.data && fixturesRes.data.length > 0) {
        setSelectedFixture(fixturesRes.data[0].fixture_id.toString());
      }
    } catch (err) {
      console.error("Error loading data:", err);
      alert("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedFixture || !quantity || parseFloat(quantity) <= 0) {
      alert("Please select a fixture and enter a valid quantity");
      return;
    }

    if (parseFloat(quantity) > sourceItem.item_current_quantity) {
      alert(`Insufficient stock. Available: ${sourceItem.item_current_quantity}`);
      return;
    }

    setTransferring(true);
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));

      await API.post("/inventory/transfer", {
        source_item_id: parseInt(sourceItemId),
        dest_item_id: parseInt(destItemId),
        quantity: parseInt(quantity),
        employee_id: payload.employee_id,
        fixture_id: parseInt(selectedFixture),
        remarks: remarks
      });

      alert("Transfer successful!");
      navigate("/dashboard/reports/low-stock");
    } catch (err) {
      console.error("Transfer error:", err);
      alert(err.response?.data?.detail || "Failed to transfer items");
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Transfer Items Between Projects</h1>
      </div>

      <div className="max-w-4xl mx-auto px-10">
        {/* Source Item Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Source (From)</h2>
          {sourceItem && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Item Name</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{sourceItem.item_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Project</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{sourceItem.project_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Quantity</p>
                <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                  {sourceItem.item_current_quantity} {sourceItem.item_unit || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Test Area</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{sourceItem.test_area || "N/A"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Destination Item Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Destination (To)</h2>
          {destItem && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Item Name</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{destItem.item_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Project</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{destItem.project_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Quantity</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  {destItem.item_current_quantity} {destItem.item_unit || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Test Area</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{destItem.test_area || "N/A"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Transfer Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Transfer Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Fixture</label>
              <select
                className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                value={selectedFixture}
                onChange={(e) => setSelectedFixture(e.target.value)}
              >
                <option value="">Select Fixture</option>
                {fixtures.map((fx) => (
                  <option key={fx.fixture_id} value={fx.fixture_id}>
                    {fx.fixture_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Quantity (Max: {sourceItem?.item_current_quantity || 0})
              </label>
              <input
                type="number"
                min="1"
                max={sourceItem?.item_current_quantity || 0}
                className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Remarks (Optional)</label>
              <textarea
                className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded transition-colors"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes about this transfer..."
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-6 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              onClick={handleTransfer}
              disabled={transferring || !selectedFixture || !quantity}
            >
              {transferring ? "Transferring..." : "Confirm Transfer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


