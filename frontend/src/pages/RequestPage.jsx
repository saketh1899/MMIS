// src/pages/RequestPage.jsx
import { useEffect, useState, useRef } from "react";
import API from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";

export default function RequestPage() {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showDropdown, setShowDropdown] = useState(false);

  const project = params.get("project");
  const test_area = params.get("test_area");

  // Load items from backend with filtering
  useEffect(() => {
    if (!project || !test_area) {
      setItems([]);
      setFilteredItems([]);
      return;
    }
    
    // Properly encode URL parameters
    const encodedProject = encodeURIComponent(project);
    const encodedTestArea = encodeURIComponent(test_area);
    
    API.get(`/inventory/?project=${encodedProject}&test_area=${encodedTestArea}`)
      .then((res) => {
        // Ensure res.data is always an array
        const data = Array.isArray(res.data) ? res.data : [];
        setItems(data);
        setFilteredItems(data);
      })
      .catch((err) => {
        console.error("Failed to load items", err);
        // Always set to empty array on error to prevent .map() errors
        setItems([]);
        setFilteredItems([]);
      });
  }, [project, test_area]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchInput(query);
    if (Array.isArray(items)) {
      setFilteredItems(
        items.filter((item) =>
          item?.item_name?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredItems([]);
    }
  };

  const handleSelect = (item) => {
    navigate(`/dashboard/request/item/${item.item_id}?project=${project}&test_area=${test_area}`);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Search Inventory</h1>
      </div>

      <p className="text-center mt-4 text-gray-700 dark:text-gray-300 font-semibold text-lg">
        Project: <span className="text-blue-600 dark:text-blue-400">{project}</span> — Test Area:{" "}
        <span className="text-blue-600 dark:text-blue-400">{test_area}</span>
      </p>

      <div className="p-6 rounded-lg w-full max-w-4xl mx-auto mt-6">

        {/* SEARCH BAR */}
        <div className="relative w-full">
          <input
            ref={searchRef}
            type="text"
            className="w-full p-3 pl-3 pr-10 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm transition-colors"
            placeholder="Search or select by item name..."
            value={searchInput}
            onChange={handleSearch}
            onFocus={() => setShowDropdown(true)}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(prev => !prev);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition"
          >
            <svg
              className={`w-5 h-5 transform transition-transform duration-200 ${
              showDropdown ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>



          {/* Dropdown results */}
          {/* DROPDOWN RESULTS (Works with search + arrow click) */}
          {showDropdown && (
            <div
              className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-[500px] overflow-y-auto z-50 transition-colors"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
            {(Array.isArray(searchInput ? filteredItems : items) ? (searchInput ? filteredItems : items) : []).map((item) => (
            <div
              key={item.item_id}
              onClick={() => {
                handleSelect(item);
                setShowDropdown(false);
              }}
              className="p-3 border-b dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer transition-colors flex items-center gap-4"
            >
              {/* Item Image */}
              {getImageUrl(item.item_image_url) ? (
                <div className="flex-shrink-0">
                  <img 
                    src={getImageUrl(item.item_image_url)} 
                    alt={item.item_name}
                    className="w-16 h-16 object-cover rounded border dark:border-gray-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded border dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                  No Image
                </div>
              )}
              
              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{item.item_name}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {item.item_description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {item.item_current_quantity} | Part #: {item.item_part_number}
                </div>
              </div>
            </div>
          ))}
          {Array.isArray(items) && items.length === 0 && (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              No items found
            </div>
          )}
        </div>
      )}  
    </div>  

    {/* Back Button */}
    <div className="flex justify-center mt-10">
      <button
        className="px-8 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 shadow transition-colors"
        onClick={() =>
            navigate(`/dashboard/request/test-area?project=${project}`)
          }
        >
          Back
        </button>
      </div>
  </div>
</div> 
);
}   
   


