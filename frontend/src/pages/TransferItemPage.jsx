import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";

export default function TransferItemPage() {
  const MIN_SEARCH_LENGTH = 2;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sourceItemId = searchParams.get("source_item_id");
  const destItemId = searchParams.get("dest_item_id");

  const [inventoryItems, setInventoryItems] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [selectedDestId, setSelectedDestId] = useState("");

  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedFixture, setSelectedFixture] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, fixturesRes] = await Promise.all([API.get("/inventory/"), API.get("/fixtures/")]);

      const allItems = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];
      const allFixtures = Array.isArray(fixturesRes.data) ? fixturesRes.data : [];

      setInventoryItems(allItems);
      setFixtures(allFixtures);

      if (fixturesRes.data && fixturesRes.data.length > 0) {
        setSelectedFixture(fixturesRes.data[0].fixture_id.toString());
      }
    } catch (err) {
      console.error("Error loading data:", err);
      alert("Failed to load transfer data");
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = useMemo(() => {
    const map = new Map();
    for (const item of inventoryItems) {
      const key = `${(item.item_name || "").trim().toLowerCase()}|${(item.item_part_number || "").trim().toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          item_name: item.item_name || "N/A",
          item_part_number: item.item_part_number || "N/A",
          items: [],
        });
      }
      map.get(key).items.push(item);
    }
    return Array.from(map.values()).sort((a, b) => a.item_name.localeCompare(b.item_name));
  }, [inventoryItems]);

  const filteredGroups = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (q.length < MIN_SEARCH_LENGTH) return [];
    return groupedItems.filter(
      (g) => g.item_name.toLowerCase().includes(q) || (g.item_part_number || "").toLowerCase().includes(q)
    );
  }, [groupedItems, searchTerm]);

  useEffect(() => {
    // Pre-select from navigation links (low-stock shortcut).
    if (!inventoryItems.length || (!sourceItemId && !destItemId)) return;

    const source = inventoryItems.find((i) => String(i.item_id) === String(sourceItemId));
    const dest = inventoryItems.find((i) => String(i.item_id) === String(destItemId));
    if (!source || !dest) return;

    const key = `${(source.item_name || "").trim().toLowerCase()}|${(source.item_part_number || "").trim().toLowerCase()}`;
    setSelectedGroupKey(key);
    setSearchTerm(source.item_name || source.item_part_number || "");
    setSelectedSourceId(String(source.item_id));
    setSelectedDestId(String(dest.item_id));
  }, [inventoryItems, sourceItemId, destItemId]);

  useEffect(() => {
    // Clear source/destination selection when user switches to another matched item group.
    setSelectedSourceId("");
    setSelectedDestId("");
    setQuantity("");
  }, [selectedGroupKey]);

  const selectedGroup = useMemo(
    () => groupedItems.find((g) => g.key === selectedGroupKey) || null,
    [groupedItems, selectedGroupKey]
  );
  const sourceItem = selectedGroup?.items.find((i) => String(i.item_id) === String(selectedSourceId)) || null;
  const destItem = selectedGroup?.items.find((i) => String(i.item_id) === String(selectedDestId)) || null;

  const handleTransfer = async () => {
    if (!sourceItem || !destItem) {
      alert("Please select both source and destination projects.");
      return;
    }
    if (sourceItem.item_id === destItem.item_id) {
      alert("Source and destination must be different.");
      return;
    }
    if (!selectedFixture) {
      alert("Please select a fixture.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    if (Number(quantity) > Number(sourceItem.item_current_quantity || 0)) {
      alert(`Insufficient stock. Available: ${sourceItem.item_current_quantity}`);
      return;
    }

    setTransferring(true);
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));

      await API.post("/inventory/transfer", {
        source_item_id: Number(sourceItem.item_id),
        dest_item_id: Number(destItem.item_id),
        quantity: Number(quantity),
        employee_id: payload.employee_id,
        fixture_id: Number(selectedFixture),
        remarks: remarks || "",
      });

      alert("Transfer successful!");
      await loadData();
      setQuantity("");
      setRemarks("");
    } catch (err) {
      console.error("Transfer error:", err);
      alert(err.response?.data?.detail || "Failed to transfer items");
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        <div className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading transfer page...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      <Header />

      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Transfer</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 pb-8">
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">Search Item</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedGroupKey("");
            }}
            placeholder="Search by item name or part number..."
            className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg transition-colors"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enter at least {MIN_SEARCH_LENGTH} characters to search.
          </p>
        </div>

        {/* Matches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Matched Items</h2>
            {filteredGroups.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredGroups.length} match{filteredGroups.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          {searchTerm.trim().length < MIN_SEARCH_LENGTH ? (
            <p className="text-gray-500 dark:text-gray-400">Start typing to see matched items.</p>
          ) : filteredGroups.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No matching item found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGroups.map((group) => (
                <button
                  key={group.key}
                  onClick={() => setSelectedGroupKey(group.key)}
                  className={`text-left border rounded-lg p-4 transition-colors ${
                    selectedGroupKey === group.key
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{group.item_name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Part #: {group.item_part_number || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {group.items.length} project record{group.items.length !== 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project records for selected item */}
        {selectedGroup && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Select Source and Destination
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Project</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Test Area</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Quantity</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Select as Source</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Select as Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.items.map((item) => (
                    <tr key={item.item_id} className="border-b dark:border-gray-700">
                      <td className="p-3 text-gray-800 dark:text-gray-200">{item.project_name || "N/A"}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{item.test_area || "N/A"}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200 font-semibold">
                        {item.item_current_quantity} {item.item_unit || ""}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedSourceId(String(item.item_id))}
                          className={`px-3 py-1.5 rounded text-xs font-semibold ${
                            String(selectedSourceId) === String(item.item_id)
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {String(selectedSourceId) === String(item.item_id) ? "Selected" : "Set Source"}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedDestId(String(item.item_id))}
                          className={`px-3 py-1.5 rounded text-xs font-semibold ${
                            String(selectedDestId) === String(item.item_id)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {String(selectedDestId) === String(item.item_id) ? "Selected" : "Set Destination"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transfer Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Transfer Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">Source (From)</p>
              {sourceItem ? (
                <>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{sourceItem.project_name || "N/A"}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{sourceItem.test_area || "N/A"}</p>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300 mt-1">
                    Available: {sourceItem.item_current_quantity} {sourceItem.item_unit || ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Not selected</p>
              )}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Destination (To)</p>
              {destItem ? (
                <>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{destItem.project_name || "N/A"}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{destItem.test_area || "N/A"}</p>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mt-1">
                    Current: {destItem.item_current_quantity} {destItem.item_unit || ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Not selected</p>
              )}
            </div>
          </div>

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
                placeholder="Add notes about transfer..."
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-6 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              onClick={handleTransfer}
              disabled={transferring || !sourceItem || !destItem || !selectedFixture || !quantity}
            >
              {transferring ? "Transferring..." : "Transfer"}
            </button>
          </div>

          {!fixtures.length && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
              No fixtures found. Please create a fixture before transferring.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
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


