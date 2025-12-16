// src/pages/RestockItemPage.jsx
import { useEffect, useState, useRef } from "react";
import API from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockItemPage() {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [userName, setUserName] = useState("");
  const [accessLevel, setAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showDropdown, setShowDropdown] = useState(false);

  const project = params.get("project");
  const test_area = params.get("test_area");

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Load access level
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Token stores access level as "role" field
        setAccessLevel(payload.role);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
    setLoading(false);
  }, []);

  // Load items from backend with filtering
  useEffect(() => {
    if (!project || !test_area) {
      setItemsLoading(false);
      return;
    }
    
    setItemsLoading(true);
    const encodedProject = encodeURIComponent(project);
    const encodedTestArea = encodeURIComponent(test_area);
    
    API.get(`/inventory?project=${encodedProject}&test_area=${encodedTestArea}`)
      .then((res) => {
        const loadedItems = res.data || [];
        setItems(loadedItems);
        setFilteredItems(loadedItems);
      })
      .catch((err) => {
        console.error("Failed to load items", err);
        setItems([]);
        setFilteredItems([]);
      })
      .finally(() => {
        setItemsLoading(false);
      });
  }, [project, test_area]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter items based on search input
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredItems(items);
      return;
    }

    const query = searchInput.toLowerCase();
    const filtered = items.filter((item) => {
      const nameMatch = item.item_name?.toLowerCase().includes(query);
      const partNumberMatch = item.item_part_number?.toLowerCase().includes(query);
      const descriptionMatch = item.item_description?.toLowerCase().includes(query);
      const idMatch = item.item_id?.toString().includes(query);
      
      return nameMatch || partNumberMatch || descriptionMatch || idMatch;
    });
    
    setFilteredItems(filtered);
  }, [searchInput, items]);

  // NOW WE CAN DO CONDITIONAL RETURNS AFTER ALL HOOKS
  // Check if user is admin
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (accessLevel !== "admin") {
    return <AccessDenied feature="the Restock feature" />;
  }

  // Show error if missing parameters
  if (!project || !test_area) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">Missing project or test area parameters</p>
          <button
            onClick={() => navigate("/dashboard/restock/project")}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Go Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    if (e.target.value.trim()) {
      setShowDropdown(true);
    }
  };

  const handleSelect = (item) => {
    navigate(`/dashboard/restock/item/${item.item_id}/edit?project=${project}&test_area=${test_area}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" style={{ minHeight: '100vh' }}>
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
        <div className="relative w-full mb-6">
          <input
            ref={searchRef}
            type="text"
            className="w-full p-3 pl-3 pr-10 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Search Bar with dropdown"
            value={searchInput}
            onChange={handleSearch}
            onFocus={() => {
              if (items.length > 0) {
                setShowDropdown(true);
              }
            }}
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
          {showDropdown && items.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-[400px] overflow-y-auto z-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredItems.length === 0 ? (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  No items found matching "{searchInput}"
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.item_id}
                    onClick={() => {
                      handleSelect(item);
                      setShowDropdown(false);
                      setSearchInput("");
                    }}
                    className="p-3 border-b dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <div className="font-semibold text-gray-900 dark:text-gray-200">{item.item_name}</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {item.item_description || "No description"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-4">
                      <span>ID: {item.item_id}</span>
                      <span>Part #: {item.item_part_number || "N/A"}</span>
                      <span>Qty: {item.item_current_quantity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ITEM INFORMATION BLOCKS */}
      <div className="mt-4 max-w-5xl mx-auto px-6">
        {itemsLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-lg font-semibold mb-2">
              {searchInput ? `No items found matching "${searchInput}"` : "No items found for this project and test area."}
            </p>
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setFilteredItems(items);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
            </div>
            {filteredItems.map((item) => (
              <div
                key={item.item_id}
                onClick={() => handleSelect(item)}
                className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 shadow-md cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors mb-3"
              >
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">{item.item_name}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong className="text-gray-700 dark:text-gray-300">Description:</strong> <span className="text-gray-700 dark:text-gray-300">{item.item_description || "N/A"}</span></div>
                  <div><strong className="text-gray-700 dark:text-gray-300">ID:</strong> <span className="text-gray-700 dark:text-gray-300">{item.item_id}</span></div>
                  <div><strong className="text-gray-700 dark:text-gray-300">Part Number:</strong> <span className="text-gray-700 dark:text-gray-300">{item.item_part_number || "N/A"}</span></div>
                  <div><strong className="text-gray-700 dark:text-gray-300">Current Quantity:</strong> <span className="text-gray-700 dark:text-gray-300 font-semibold">{item.item_current_quantity}</span></div>
                  <div><strong className="text-gray-700 dark:text-gray-300">Test Area:</strong> <span className="text-gray-700 dark:text-gray-300">{item.test_area || "N/A"}</span></div>
                  <div><strong className="text-gray-700 dark:text-gray-300">Unit:</strong> <span className="text-gray-700 dark:text-gray-300">{item.item_unit || "N/A"}</span></div>
                  <div><strong className="text-gray-700 dark:text-gray-300">Minimum Count:</strong> <span className="text-gray-700 dark:text-gray-300">{item.item_min_count}</span></div>
                  <div><strong className="text-gray-700 dark:text-gray-300">Manufacturer:</strong> <span className="text-gray-700 dark:text-gray-300">{item.item_manufacturer || "N/A"}</span></div>
                  <div className="col-span-2"><strong className="text-gray-700 dark:text-gray-300">Project Name:</strong> <span className="text-gray-700 dark:text-gray-300">{item.project_name || "N/A"}</span></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-center mt-10 mb-8">
        <button
          className="px-8 py-2 bg-blue-200 dark:bg-blue-700 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 shadow transition-colors"
          onClick={() =>
              navigate(`/dashboard/restock/test-area?project=${project}`)
          }
        >
          Back
        </button>
      </div>
      </div>
  );
}

