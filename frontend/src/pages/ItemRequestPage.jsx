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
  const [alternativeItems, setAlternativeItems] = useState([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load item details
  useEffect(() => {
    API.get(`/inventory/${item_id}`)
      .then((res) => {
        setItem(res.data);
        // If item is out of stock, automatically check for alternatives
        if (res.data && res.data.item_current_quantity === 0) {
          loadAlternativeItems(item_id);
        }
      })
      .catch((err) => console.error("Error loading item:", err));
  }, [item_id]);

  // Load alternative items
  const loadAlternativeItems = async (itemId) => {
    setLoadingAlternatives(true);
    try {
      const res = await API.get(`/inventory/${itemId}/alternatives`);
      setAlternativeItems(res.data || []);
      setShowAlternatives(res.data && res.data.length > 0);
    } catch (err) {
      console.error("Error loading alternative items:", err);
      setAlternativeItems([]);
      setShowAlternatives(false);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  // Projects that don't require fixtures
  const skipFixtureProjects = ["Hi-Lo", "Flying Probe", "Development"];
  const requiresFixture = project && !skipFixtureProjects.includes(project);

  // Load fixtures — Only for projects that require fixtures
  useEffect(() => {
    if (!requiresFixture) {
      setFixtures([]);
      return;
    }
    API.get(`/fixtures/filter?project=${project || ""}&test_area=${test_area || ""}`)
      .then((res) => setFixtures(res.data))
      .catch((err) => console.error("Error loading fixtures:", err));
  }, [project, test_area, requiresFixture]);

  const submitRequest = async () => {
    // Validation: fixture required only for projects that need it
    if (requiresFixture && !fixture) {
      alert("Select fixture");
      return;
    }
    if (!quantity) {
      alert("Enter quantity");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));

      const requestData = {
        employee_id: payload.employee_id,
        item_id,
        quantity: Number(quantity),
        test_area: test_area || null,
        project_name: project,
        transaction_type: "Request",
        fixture_id: (requiresFixture && fixture) ? Number(fixture) : null,
      };

      const response = await API.post("/inventory/request", requestData);

      // Check if transfer was used
      if (response.data && response.data.transfer_used) {
        alert(`Request submitted! ${response.data.transferred_from_other_projects} units were automatically transferred from other projects.`);
      } else {
      alert("Request submitted!");
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail || "Failed to submit request";
      alert(errorMessage);
      
      // If request failed due to insufficient stock, show alternatives if not already shown
      if (err.response?.status === 400 && !showAlternatives) {
        loadAlternativeItems(item_id);
    }
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Get API base URL (same logic as api.js)
    const apiBaseUrl = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000');
    // Prepend the API base URL
    return `${apiBaseUrl}${imageUrl}`;
  };

  // MUST COME AFTER HOOKS
  if (!item) return <h2 className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-3 mb-4 shadow-md transition-colors">
        <h1 className="text-2xl font-bold">Request Item</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4">

        {/* ITEM CARD */}
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-4 mb-4 transition-colors">
          <div className="flex gap-5">
            {/* Item Image */}
            <div className="flex-shrink-0 relative">
              {getImageUrl(item.item_image_url) ? (
                <div className="relative group">
                  <img 
                    src={getImageUrl(item.item_image_url)} 
                    alt={item.item_name}
                    className="w-48 h-48 object-contain rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 p-2 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  {/* Zoom indicator */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Click to enlarge</p>
                </div>
              ) : null}
              <div 
                className="w-48 h-48 bg-gray-200 dark:bg-gray-600 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm shadow-md"
                style={{ display: getImageUrl(item.item_image_url) ? 'none' : 'flex' }}
              >
                No Image
              </div>
            </div>
            
            {/* Item Details */}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">{item.item_name}</h2>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-gray-100">Part Number:</strong> {item.item_part_number || "N/A"}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-gray-100">Description:</strong> {item.item_description || "N/A"}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-gray-100">Manufacturer:</strong> {item.item_manufacturer || "N/A"}
                </p>
                <p className={`mt-2 font-bold ${
                  item.item_current_quantity === 0 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-green-600 dark:text-green-400"
                }`}>
                  Current Quantity: {item.item_current_quantity}
                  {item.item_current_quantity === 0 && (
                    <span className="ml-2 text-xs">(Out of Stock)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ALTERNATIVE ITEMS CARD - Show when item is out of stock */}
        {showAlternatives && item && item.item_current_quantity === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow p-6 mb-8 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                ⚠️ Out of Stock: Same item available in other projects
              </h3>
              <button
                onClick={() => setShowAlternatives(false)}
                className="text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              <strong>{item.item_name}</strong> is out of stock in <strong>{item.project_name}</strong>. 
              The same item is available in other projects. You can transfer items or the system will automatically transfer when you make a request:
            </p>

            {loadingAlternatives ? (
              <p className="text-yellow-700 dark:text-yellow-300">Loading alternatives...</p>
            ) : alternativeItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-yellow-100 dark:bg-yellow-900/40 border-b dark:border-yellow-800">
                      <th className="p-3 text-left font-semibold text-yellow-800 dark:text-yellow-200">Project</th>
                      <th className="p-3 text-left font-semibold text-yellow-800 dark:text-yellow-200">Test Area</th>
                      <th className="p-3 text-left font-semibold text-yellow-800 dark:text-yellow-200">Available Qty</th>
                      <th className="p-3 text-left font-semibold text-yellow-800 dark:text-yellow-200">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alternativeItems.map((altItem) => (
                      <tr key={altItem.item_id} className="border-b dark:border-yellow-800">
                        <td className="p-3 text-yellow-800 dark:text-yellow-200">{altItem.project_name}</td>
                        <td className="p-3 text-yellow-800 dark:text-yellow-200">{altItem.test_area || "N/A"}</td>
                        <td className="p-3 font-semibold text-green-600 dark:text-green-400">
                          {altItem.item_current_quantity} {altItem.item_unit || ""}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => navigate(`/dashboard/transfer?source_item_id=${altItem.item_id}&dest_item_id=${item.item_id}`)}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition-colors"
                          >
                            Transfer to {item.project_name}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-yellow-700 dark:text-yellow-300">No alternatives found in other projects.</p>
            )}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-4 flex flex-col gap-3 transition-colors">

          {/* Fixture field - only show for projects that require it */}
          {requiresFixture && (
            <>
              <label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Fixture</label>
              <select
                className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded text-sm transition-colors"
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
            </>
          )}

          <label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Quantity</label>
          <input
            type="number"
            min="1"
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded text-sm transition-colors"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />

          <label className="font-semibold text-sm text-gray-700 dark:text-gray-300">Remarks (Optional)</label>
          <input
            type="text"
            className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded text-sm transition-colors"
            placeholder="Any notes..."
          />

          <div className="flex justify-center gap-4 mt-4">
            <button
              className="px-5 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-sm transition-colors"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

            <button
              className="px-5 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 text-sm transition-colors"
              onClick={submitRequest}
            >
              Submit Request
            </button>
          </div>

        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && getImageUrl(item.item_image_url) && (
        <div 
          className="fixed inset-0 bg-black/80 dark:bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10 shadow-lg"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={getImageUrl(item.item_image_url)} 
              alt={item.item_name}
              className="w-full h-full object-contain rounded-lg bg-white dark:bg-gray-800 p-4"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-4 text-lg font-semibold">{item.item_name}</p>
          </div>
        </div>
      )}

    </div>
  );
}
