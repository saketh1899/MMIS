// src/pages/RequestPage.jsx
import { useEffect, useState, useMemo } from "react";
import API from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";

export default function RequestPage() {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const project = params.get("project");
  const test_area = params.get("test_area");

  // Load items from backend with filtering
  useEffect(() => {
    if (!project) {
      setItems([]);
      return;
    }

    const skipTestAreaProjects = ["Hi-Lo", "Flying Probe", "Development"];
    const requiresTestArea = !skipTestAreaProjects.includes(project);

    if (requiresTestArea && !test_area) {
      setItems([]);
      return;
    }

    const encodedProject = encodeURIComponent(project);
    let url = `/inventory/?project=${encodedProject}`;
    if (test_area) {
      url += `&test_area=${encodeURIComponent(test_area)}`;
    }

    API.get(url)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setItems(data);
      })
      .catch((err) => {
        console.error("Failed to load items", err);
        setItems([]);
      });
  }, [project, test_area]);

  const displayItems = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const name = item?.item_name?.toLowerCase() || "";
      const part = (item?.item_part_number || "").toLowerCase();
      return name.includes(q) || part.includes(q);
    });
  }, [items, searchInput]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSelect = (item) => {
    let url = `/dashboard/request/item/${item.item_id}?project=${encodeURIComponent(project)}`;
    if (test_area) {
      url += `&test_area=${encodeURIComponent(test_area)}`;
    }
    navigate(url);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const apiBaseUrl =
      import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000");
    return `${apiBaseUrl}${imageUrl}`;
  };

  const renderItemRow = (item) => (
    <div
      key={item.item_id}
      role="button"
      tabIndex={0}
      onClick={() => handleSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect(item);
        }
      }}
      className="p-3 border-b dark:border-gray-600 last:border-b-0 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer transition-colors flex items-center gap-4 text-left"
    >
      {getImageUrl(item.item_image_url) ? (
        <div className="flex-shrink-0">
          <img
            src={getImageUrl(item.item_image_url)}
            alt={item.item_name}
            className="w-16 h-16 object-cover rounded border dark:border-gray-600"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded border dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
          No Image
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 dark:text-gray-200">{item.item_name}</div>
        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{item.item_description}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Qty: {item.item_current_quantity} | Part #: {item.item_part_number}
        </div>
      </div>
    </div>
  );

  const goBack = () => {
    const skipTestAreaProjects = ["Hi-Lo", "Flying Probe", "Development"];
    if (skipTestAreaProjects.includes(project)) {
      navigate("/dashboard/request");
    } else {
      navigate(`/dashboard/request/test-area?project=${encodeURIComponent(project)}`);
    }
  };

  return (
    <div className="min-h-0 flex flex-col bg-transparent transition-colors">
      <Header />

      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 shadow-md transition-colors relative">
        <h1 className="text-3xl font-bold">Search Inventory</h1>
      </div>

      {/* Top placement + sticky so Back stays visible when scrolling the page (it was below the tall list before) */}
      <div className="sticky top-0 z-20 w-full max-w-4xl mx-auto px-4 pt-4 pb-2 flex justify-center sm:justify-start bg-[#e8f0fe]/95 dark:bg-gray-950/90 backdrop-blur-sm border-b border-blue-100/80 dark:border-gray-800">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <p className="text-center mt-2 text-gray-700 dark:text-gray-300 font-semibold text-lg px-4">
        Project: <span className="text-blue-600 dark:text-blue-400">{project}</span>
        {test_area && (
          <>
            {" "}
            — Test Area: <span className="text-blue-600 dark:text-blue-400">{test_area}</span>
          </>
        )}
      </p>

      <div className="p-6 pt-2 rounded-lg w-full max-w-4xl mx-auto mt-2 flex-1 min-h-0 flex flex-col">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          Filter by name or part number
        </label>
        <input
          type="search"
          className="w-full p-3 pl-3 pr-3 border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm transition-all"
          placeholder="Search or select by item name or part number..."
          value={searchInput}
          onChange={handleSearch}
          autoComplete="off"
        />

        {/* Full inventory visible immediately — search narrows the list */}
        {items.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Inventory ({displayItems.length}
                {searchInput.trim() ? ` of ${items.length}` : ""})
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-md max-h-[min(70vh,560px)] overflow-y-auto">
              {displayItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No items match your search. Clear the filter to see all items.
                </div>
              ) : (
                displayItems.map((item) => renderItemRow(item))
              )}
            </div>
          </div>
        )}

        {items.length === 0 && project && (
          <div className="mt-6 p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            No items found for this project
            {test_area ? " and test area" : ""}.
          </div>
        )}
      </div>

      <div className="flex justify-center py-6 pb-8">
        <button
          type="button"
          className="px-8 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
          onClick={goBack}
        >
          ← Back to project / test area
        </button>
      </div>
    </div>
  );
}
