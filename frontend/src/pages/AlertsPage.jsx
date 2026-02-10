import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";
import { getProjects } from "../utils/projects";

export default function AlertsPage() {
  const [allLowStockItems, setAllLowStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTestArea, setSelectedTestArea] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Dropdown states
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTestAreaDropdown, setShowTestAreaDropdown] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [testAreaSearch, setTestAreaSearch] = useState("");
  const projectRef = useRef(null);
  const testAreaRef = useRef(null);

  // Load all low stock items initially
  useEffect(() => {
    setLoading(true);
    API.get("/alerts/low-stock")
      .then((res) => {
        setAllLowStockItems(res.data);
      })
      .catch((err) => {
        console.error("Error loading low stock items:", err);
        setAllLowStockItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Get unique projects from data and merge with custom projects from localStorage
  const uniqueProjectsFromData = [...new Set(allLowStockItems.map(item => item.project_name).filter(Boolean))];
  const customProjects = getProjects();
  const allProjects = [...new Set([...customProjects, ...uniqueProjectsFromData])].sort();
  const uniqueProjects = allProjects;
  const uniqueTestAreas = [...new Set(allLowStockItems.map(item => item.test_area).filter(Boolean))].sort();

  // Filtered options for dropdowns
  const filteredProjects = uniqueProjects.filter(project =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredTestAreas = uniqueTestAreas.filter(area =>
    area.toLowerCase().includes(testAreaSearch.toLowerCase())
  );

  // Filter items based on selected project and test area
  useEffect(() => {
    let filtered = allLowStockItems;

    if (selectedProject) {
      filtered = filtered.filter(item => item.project_name === selectedProject);
    }

    if (selectedTestArea) {
      filtered = filtered.filter(item => item.test_area === selectedTestArea);
    }

    setFilteredItems(filtered);
  }, [allLowStockItems, selectedProject, selectedTestArea]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
      if (testAreaRef.current && !testAreaRef.current.contains(event.target)) {
        setShowTestAreaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync search with selected values
  useEffect(() => {
    if (selectedProject) {
      setProjectSearch(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedTestArea) {
      setTestAreaSearch(selectedTestArea);
    }
  }, [selectedTestArea]);

  const handleClearProject = () => {
    setSelectedProject("");
    setProjectSearch("");
  };

  const handleClearTestArea = () => {
    setSelectedTestArea("");
    setTestAreaSearch("");
  };

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Low Stock Alert</h1>
      </div>

      {/* FILTERS */}
      <div className="max-w-6xl mx-auto px-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name Filter */}
            <div className="relative" ref={projectRef}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filter by Project Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    setShowProjectDropdown(true);
                  }}
                  onFocus={() => setShowProjectDropdown(true)}
                  placeholder="Select Project Name"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {selectedProject && (
                  <button
                    onClick={handleClearProject}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              {showProjectDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto transition-colors">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((proj) => (
                      <div
                        key={proj}
                        onClick={() => {
                          setSelectedProject(proj);
                          setProjectSearch(proj);
                          setShowProjectDropdown(false);
                        }}
                        className={`p-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300 ${
                          selectedProject === proj ? "bg-blue-100 dark:bg-gray-600" : ""
                        }`}
                      >
                        {proj}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 dark:text-gray-400">No project found</div>
                  )}
                </div>
              )}
            </div>

            {/* Test Area Filter */}
            <div className="relative" ref={testAreaRef}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filter by Test Area
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={testAreaSearch}
                  onChange={(e) => {
                    setTestAreaSearch(e.target.value);
                    setShowTestAreaDropdown(true);
                  }}
                  onFocus={() => setShowTestAreaDropdown(true)}
                  placeholder="Select Test Area"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {selectedTestArea && (
                  <button
                    onClick={handleClearTestArea}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              {showTestAreaDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto transition-colors">
                  {filteredTestAreas.length > 0 ? (
                    filteredTestAreas.map((area) => (
                      <div
                        key={area}
                        onClick={() => {
                          setSelectedTestArea(area);
                          setTestAreaSearch(area);
                          setShowTestAreaDropdown(false);
                        }}
                        className={`p-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-300 ${
                          selectedTestArea === area ? "bg-blue-100 dark:bg-gray-600" : ""
                        }`}
                      >
                        {area}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 dark:text-gray-400">No test area found</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOW STOCK ITEMS TABLE */}
      <div className="max-w-6xl mx-auto px-8 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p className="text-xl">No low stock items found</p>
              <p className="text-sm mt-2">
                {(selectedTestArea || selectedProject)
                  ? `No items below minimum count for selected filters`
                  : "All items are above their minimum count"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">ID</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Name</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Part Number</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Description</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Current Qty</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Min Count</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Unit</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Manufacturer</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Test Area</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    // Calculate how critical the alert is (percentage of minimum)
                    const percentage = (item.item_current_quantity / item.item_min_count) * 100;
                    const isCritical = percentage < 50; // Less than 50% of minimum
                    
                    return (
                      <tr
                        key={item.item_id}
                        className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isCritical
                            ? "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                            : "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        }`}
                      >
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_id}</td>
                        <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{item.item_name}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_part_number || "N/A"}</td>
                        <td className="p-3 max-w-xs text-gray-800 dark:text-gray-200">{item.item_description || "N/A"}</td>
                        <td className="p-3">
                          <span className="text-red-600 dark:text-red-400 font-bold">
                            {item.item_current_quantity}
                          </span>
                        </td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_min_count}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_unit || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_manufacturer || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.test_area || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.project_name || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-10 mb-8">
        <button
          className="px-8 py-2 bg-blue-200 dark:bg-blue-700 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 shadow transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
