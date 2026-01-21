import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";
import { getProjects } from "../utils/projects";

export default function CurrentInventoryReportPage() {
  const [inventory, setInventory] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState(null);
  const [viewMode, setViewMode] = useState("items"); // "items" or "fixtures"
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTestArea, setSelectedTestArea] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTestAreaDropdown, setShowTestAreaDropdown] = useState(false);
  const [accessLevel, setAccessLevel] = useState(null);
  const navigate = useNavigate();

  // Load access level from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAccessLevel(payload.role);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  // Predefined lists for dropdowns
  const [projects, setProjects] = useState(getProjects());

  // Reload projects when component mounts or when projects are updated
  useEffect(() => {
    const handleProjectsUpdate = () => {
      setProjects(getProjects());
    };

    // Listen for custom event and storage changes
    window.addEventListener('projectsUpdated', handleProjectsUpdate);
    window.addEventListener('storage', handleProjectsUpdate);

    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate);
      window.removeEventListener('storage', handleProjectsUpdate);
    };
  }, []);

  const testAreas = [
    "ICT_Mobo", "BSI_Mobo", "FBT_Mobo", "ICT_Agora", "FBT_Agora", "TOOLS"
  ];

  // Load current inventory
  useEffect(() => {
    setLoading(true);
    let url = "/inventory/";
    const params = [];
    if (selectedProject) params.push(`project=${encodeURIComponent(selectedProject)}`);
    if (selectedTestArea) params.push(`test_area=${encodeURIComponent(selectedTestArea)}`);
    if (params.length > 0) url += `?${params.join("&")}`;

    API.get(url)
      .then((res) => {
        setInventory(res.data);
      })
      .catch((err) => {
        console.error("Error loading inventory:", err);
        setInventory([]);
      })
      .finally(() => setLoading(false));
  }, [selectedProject, selectedTestArea]);

  // Load fixtures
  useEffect(() => {
    if (viewMode === "fixtures") {
      setLoading(true);
      let url = "/fixtures/filter";
      const params = [];
      if (selectedProject) params.push(`project=${encodeURIComponent(selectedProject)}`);
      if (selectedTestArea) params.push(`test_area=${encodeURIComponent(selectedTestArea)}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      else url = "/fixtures/";

      API.get(url)
        .then((res) => {
          setFixtures(res.data);
        })
        .catch((err) => {
          console.error("Error loading fixtures:", err);
          setFixtures([]);
        })
        .finally(() => setLoading(false));
    }
  }, [viewMode, selectedProject, selectedTestArea]);

  const downloadCSV = () => {
    if (viewMode === "items" && inventory.length === 0) {
      alert("No data to download");
      return;
    }
    if (viewMode === "fixtures" && fixtures.length === 0) {
      alert("No data to download");
      return;
    }

    let headers, rows, filename;

    if (viewMode === "items") {
      headers = [
        "Item ID",
        "Item Name",
        "Part Number",
        "Description",
        "Current Quantity",
        "Minimum Count",
        "Unit",
        "Manufacturer",
        "Type",
        "Test Area",
        "Project Name",
        "Life Cycle",
        "Unit Price"
      ];

      rows = inventory.map((item) => [
        item.item_id || "",
        item.item_name || "",
        item.item_part_number || "",
        item.item_description || "",
        item.item_current_quantity || 0,
        item.item_min_count || 0,
        item.item_unit || "",
        item.item_manufacturer || "",
        item.item_type || "",
        item.test_area || "",
        item.project_name || "",
        item.item_life_cycle || "",
        item.item_unit_price || ""
      ]);

      filename = `current_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      headers = [
        "Fixture ID",
        "Fixture Number",
        "Test Area",
        "Project Name",
        "Asset Tag",
        "Fixture Serial Number"
      ];

      rows = fixtures.map((fixture) => [
        fixture.fixture_id || "",
        fixture.fixture_name || "",
        fixture.test_area || "",
        fixture.project_name || "",
        fixture.asset_tag || "",
        fixture.fixture_serial_number || ""
      ]);

      filename = `current_fixtures_${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Current Inventory Report</h1>
      </div>


      {/* VIEW MODE TOGGLE */}
      <div className="max-w-7xl mx-auto px-10 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode("items");
              setSelectedItemId(null);
            }}
            className={`px-8 py-3 rounded shadow transition text-base font-semibold ${
              viewMode === "items"
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Items
          </button>
          <button
            onClick={() => {
              setViewMode("fixtures");
              setSelectedFixtureId(null);
            }}
            className={`px-8 py-3 rounded shadow transition text-base font-semibold ${
              viewMode === "fixtures"
                ? "bg-blue-600 dark:bg-blue-700 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Fixtures
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto px-10 mb-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex gap-6 items-end transition-colors">
          {/* Project Name Filter */}
          <div className="flex-1 relative">
            <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">Project Name</label>
            <div className="relative">
              <input
                type="text"
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setShowProjectDropdown(true);
                }}
                onFocus={() => setShowProjectDropdown(true)}
                onBlur={() => setTimeout(() => setShowProjectDropdown(false), 200)}
                placeholder="Search with Dropdown"
                className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded pr-8 text-base transition-colors"
              />
              <svg
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showProjectDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto z-50 transition-colors">
                  <div
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                    onClick={() => {
                      setSelectedProject("");
                      setShowProjectDropdown(false);
                    }}
                  >
                    Clear Filter
                  </div>
                  {projects
                    .filter((proj) =>
                      proj.toLowerCase().includes(selectedProject.toLowerCase())
                    )
                    .map((proj) => (
                      <div
                        key={proj}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                        onClick={() => {
                          setSelectedProject(proj);
                          setShowProjectDropdown(false);
                        }}
                      >
                        {proj}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Area Filter */}
          <div className="flex-1 relative">
            <label className="block mb-2 text-base font-semibold text-gray-700 dark:text-gray-300">Test Area</label>
            <div className="relative">
              <input
                type="text"
                value={selectedTestArea}
                onChange={(e) => {
                  setSelectedTestArea(e.target.value);
                  setShowTestAreaDropdown(true);
                }}
                onFocus={() => setShowTestAreaDropdown(true)}
                onBlur={() => setTimeout(() => setShowTestAreaDropdown(false), 200)}
                placeholder="Search with Dropdown"
                className="w-full p-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded pr-8 text-base transition-colors"
              />
              <svg
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showTestAreaDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto z-50 transition-colors">
                  <div
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                    onClick={() => {
                      setSelectedTestArea("");
                      setShowTestAreaDropdown(false);
                    }}
                  >
                    Clear Filter
                  </div>
                  {testAreas
                    .filter((area) =>
                      area.toLowerCase().includes(selectedTestArea.toLowerCase())
                    )
                    .map((area) => (
                      <div
                        key={area}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
                        onClick={() => {
                          setSelectedTestArea(area);
                          setShowTestAreaDropdown(false);
                        }}
                      >
                        {area}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedProject || selectedTestArea) && (
            <button
              onClick={() => {
                setSelectedProject("");
                setSelectedTestArea("");
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 shadow transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY AND DOWNLOAD BUTTON */}
      <div className="max-w-7xl mx-auto px-10 mb-6 flex justify-between items-center">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          {loading ? "Loading..." : viewMode === "items" 
            ? `Total Items: ${inventory.length}` 
            : `Total Fixtures: ${fixtures.length}`}
        </div>
        <button
          onClick={downloadCSV}
          disabled={loading || (viewMode === "items" ? inventory.length === 0 : fixtures.length === 0)}
          className="px-8 py-3 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 shadow disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-base font-semibold transition-colors"
        >
          Download CSV
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="max-w-7xl mx-auto px-10 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 transition-colors">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : viewMode === "items" ? (
            inventory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No inventory items found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Part Number</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Current Quantity</th>
                      <th className="p-3 text-left">Min Count</th>
                      <th className="p-3 text-left">Unit</th>
                      <th className="p-3 text-left">Manufacturer</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Test Area</th>
                      <th className="p-3 text-left">Project Name</th>
                      <th className="p-3 text-left">Life Cycle</th>
                      <th className="p-3 text-left">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr 
                        key={item.item_id} 
                        onClick={() => setSelectedItemId(item.item_id)}
                        className={`border-b dark:border-gray-700 cursor-pointer transition-colors ${
                          selectedItemId === item.item_id 
                            ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_id}</td>
                        <td className={`p-3 font-medium text-gray-800 dark:text-gray-200 ${selectedItemId === item.item_id ? "text-blue-700 dark:text-blue-400 font-bold" : ""}`}>{item.item_name}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_part_number || "N/A"}</td>
                        <td className="p-3 max-w-xs text-gray-800 dark:text-gray-200">{item.item_description || "N/A"}</td>
                        <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">{item.item_current_quantity}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_min_count}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_unit || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_manufacturer || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_type || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.test_area || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.project_name || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_life_cycle || "N/A"}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_unit_price || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            fixtures.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No fixtures found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Fixture ID</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Fixture Number</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Test Area</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Project Name</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Asset Tag</th>
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Serial Number</th>
                      {accessLevel === "admin" && (
                        <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {fixtures.map((fixture) => (
                      <tr 
                        key={fixture.fixture_id} 
                        className={`border-b dark:border-gray-700 transition-colors ${
                          selectedFixtureId === fixture.fixture_id 
                            ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <td className="p-4 text-gray-800 dark:text-gray-200">{fixture.fixture_id}</td>
                        <td className={`p-4 font-medium text-gray-800 dark:text-gray-200 ${selectedFixtureId === fixture.fixture_id ? "text-blue-700 dark:text-blue-400 font-bold" : ""}`}>{fixture.fixture_name}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{fixture.test_area || "N/A"}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{fixture.project_name || "N/A"}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{fixture.asset_tag || "N/A"}</td>
                        <td className="p-4 text-gray-800 dark:text-gray-200">{fixture.fixture_serial_number || "N/A"}</td>
                        {accessLevel === "admin" && (
                          <td className="p-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/restock/fixture/${fixture.fixture_id}/edit`);
                              }}
                              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 shadow text-sm font-medium transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-10 mb-8">
        <button
          className="px-8 py-2 bg-blue-200 dark:bg-blue-700 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 shadow transition-colors"
          onClick={() => navigate("/dashboard/reports")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

