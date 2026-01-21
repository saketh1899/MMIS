import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";
import { getProjects } from "../utils/projects";

export default function SpendingReportPage() {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [viewMode, setViewMode] = useState("inventory"); // "inventory" or "transactions"
  const navigate = useNavigate();

  // Filter states
  const [projectName, setProjectName] = useState("");
  const [testArea, setTestArea] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [testAreaSearch, setTestAreaSearch] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTestAreaDropdown, setShowTestAreaDropdown] = useState(false);
  const projectRef = useRef(null);
  const testAreaRef = useRef(null);

  // Options
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
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
    "TOOLS",
  ];

  const filteredProjects = projects.filter(project =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredTestAreas = testAreas.filter(area =>
    area.toLowerCase().includes(testAreaSearch.toLowerCase())
  );

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

  // Load inventory data (used for both inventory view and to get unit prices for transactions)
  // Note: Inventory doesn't support date filtering, so we load all and filter client-side if needed
  useEffect(() => {
    if (viewMode === "inventory") {
      setLoading(true);
      const params = new URLSearchParams();
      if (projectName) params.append("project", projectName);
      if (testArea) params.append("test_area", testArea);

      const url = `/inventory/${params.toString() ? "?" + params.toString() : ""}`;
      
      API.get(url)
        .then((res) => {
          setInventory(res.data);
        })
        .catch((err) => {
          console.error("Error loading inventory:", err);
          setInventory([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [projectName, testArea, viewMode]);

  // Load transactions data
  useEffect(() => {
    if (viewMode === "transactions") {
      setLoading(true);
      const params = new URLSearchParams();
      if (projectName) params.append("project", projectName);
      if (testArea) params.append("test_area", testArea);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      
      // Load ALL inventory (not filtered) to ensure we have unit prices for all items
      // This is important because transactions might reference items from different projects/test_areas
      Promise.all([
        API.get("/inventory/").catch((err) => {
          console.error("Error loading inventory:", err);
          return { data: [] };
        }),
        API.get(`/transactions/all?${params.toString()}`).catch((err) => {
          console.error("Error loading transactions:", err);
          return { data: [] };
        })
      ])
        .then(([inventoryRes, transactionsRes]) => {
          // Update inventory state with ALL items (needed for unit price lookup)
          setInventory(inventoryRes.data || []);
          
          // Filter to only include request and return transactions
          const filtered = (transactionsRes.data || []).filter(tx => 
            tx.transaction_type === "request" || tx.transaction_type === "return"
          );
          setTransactions(filtered);
        })
        .catch((err) => {
          console.error("Error loading data:", err);
          setTransactions([]);
          setInventory([]);
        })
        .finally(() => setLoading(false));
    }
  }, [viewMode, projectName, testArea, startDate, endDate]);

  // Calculate total inventory value
  const calculateTotalInventoryValue = () => {
    return inventory.reduce((total, item) => {
      const price = parseFloat(item.item_unit_price?.replace(/[^0-9.]/g, '') || 0);
      const quantity = item.item_current_quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Calculate total spending from transactions (net of returns)
  const calculateTotalSpending = () => {
    const spendingByItem = calculateSpendingByItem();
    return spendingByItem.reduce((total, item) => {
      return total + item.total_spending;
    }, 0);
  };

  // Calculate spending by item (net of returns)
  const calculateSpendingByItem = () => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    const spendingMap = {};
    
    // Create a map of inventory items for unit price lookup
    // Map by exact key (name + project + test_area) and also by name only for fallback
    const inventoryMapByKey = {};
    const inventoryMapByName = {};
    
    (inventory || []).forEach(item => {
      if (item.item_name && item.item_unit_price) {
        const key = `${item.item_name}_${item.project_name || 'N/A'}_${item.test_area || 'N/A'}`;
        inventoryMapByKey[key] = item.item_unit_price;
        
        // Also store by name only for fallback lookup
        if (!inventoryMapByName[item.item_name]) {
          inventoryMapByName[item.item_name] = item.item_unit_price;
        }
      }
    });
    
    // First pass: accumulate requests and returns separately, collect unit prices and dates
    transactions.forEach(tx => {
      if (tx.item_name) {
        // Create a unique key that includes item name, project, and test area
        const key = `${tx.item_name}_${tx.project_name || 'N/A'}_${tx.test_area || 'N/A'}`;
        
        if (!spendingMap[key]) {
          spendingMap[key] = {
            item_name: tx.item_name,
            part_number: tx.item_part_number || "N/A",
            description: tx.item_description || "N/A",
            project_name: tx.project_name || "N/A",
            test_area: tx.test_area || "N/A",
            unit_price: null, // Will be set from transaction or inventory
            requested_quantity: 0,
            returned_quantity: 0,
            transaction_count: 0,
            earliest_date: null,
            latest_date: null
          };
          
          // Try to get unit price immediately from transaction, then inventory
          if (tx.item_unit_price) {
            spendingMap[key].unit_price = tx.item_unit_price;
          } else if (inventoryMapByKey[key]) {
            spendingMap[key].unit_price = inventoryMapByKey[key];
          } else if (inventoryMapByName[tx.item_name]) {
            spendingMap[key].unit_price = inventoryMapByName[tx.item_name];
          }
        }
        
        // Update unit_price if this transaction has it and we don't have one yet
        if (tx.item_unit_price && !spendingMap[key].unit_price) {
          spendingMap[key].unit_price = tx.item_unit_price;
        }
        
        // Track dates
        if (tx.created_at) {
          const txDate = new Date(tx.created_at);
          if (!spendingMap[key].earliest_date || txDate < new Date(spendingMap[key].earliest_date)) {
            spendingMap[key].earliest_date = tx.created_at;
          }
          if (!spendingMap[key].latest_date || txDate > new Date(spendingMap[key].latest_date)) {
            spendingMap[key].latest_date = tx.created_at;
          }
        }
        
        if (tx.transaction_type === "request") {
          spendingMap[key].requested_quantity += tx.quantity_used || 0;
          spendingMap[key].transaction_count += 1;
        } else if (tx.transaction_type === "return") {
          spendingMap[key].returned_quantity += tx.quantity_used || 0;
          spendingMap[key].transaction_count += 1;
        }
      }
    });
    
    // Fill in any remaining missing unit prices from inventory (second pass)
    Object.keys(spendingMap).forEach(key => {
      if (!spendingMap[key].unit_price) {
        if (inventoryMapByKey[key]) {
          spendingMap[key].unit_price = inventoryMapByKey[key];
        } else if (inventoryMapByName[spendingMap[key].item_name]) {
          spendingMap[key].unit_price = inventoryMapByName[spendingMap[key].item_name];
        }
      }
    });
    
    // Second pass: calculate net quantities and spending
    const result = Object.values(spendingMap)
      .map(item => {
        const netQuantity = item.requested_quantity - item.returned_quantity;
        const price = parseFloat(item.unit_price?.replace(/[^0-9.]/g, '') || 0);
        const netSpending = (netQuantity > 0 && price > 0) ? netQuantity * price : 0;
        
        // Format date range
        let dateRange = "N/A";
        if (item.earliest_date && item.latest_date) {
          const earliest = new Date(item.earliest_date);
          const latest = new Date(item.latest_date);
          const formatDate = (date) => {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            const hours = date.getHours() % 12 || 12;
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
            return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
          };
          
          if (earliest.getTime() === latest.getTime()) {
            dateRange = formatDate(earliest);
          } else {
            dateRange = `${formatDate(earliest)} - ${formatDate(latest)}`;
          }
        }
        
        return {
          ...item,
          total_quantity: netQuantity,
          total_spending: netSpending,
          date_range: dateRange
        };
      })
      .filter(item => item.total_quantity > 0 && item.total_spending > 0) // Only show items with positive net spending and valid price
      .sort((a, b) => b.total_spending - a.total_spending);
    
    return result;
  };

  const downloadCSV = () => {
    if (viewMode === "inventory" && inventory.length === 0) {
      alert("No data to download");
      return;
    }
    if (viewMode === "transactions" && transactions.length === 0) {
      alert("No data to download");
      return;
    }

    let headers, rows;

    if (viewMode === "inventory") {
      headers = [
        "Item ID",
        "Name",
        "Part Number",
        "Description",
        "Project Name",
        "Test Area",
        "Current Quantity",
        "Unit Price",
        "Total Value"
      ];

      rows = inventory
        .filter(item => {
          const price = parseFloat(item.item_unit_price?.replace(/[^0-9.]/g, '') || 0);
          return price > 0;
        })
        .map((item) => {
          const price = parseFloat(item.item_unit_price?.replace(/[^0-9.]/g, '') || 0);
          const quantity = item.item_current_quantity || 0;
          const totalValue = price * quantity;
          return [
            item.item_id || "",
            item.item_name || "",
            item.item_part_number || "",
            item.item_description || "N/A",
            item.project_name || "N/A",
            item.test_area || "N/A",
            quantity,
            item.item_unit_price || "N/A",
            totalValue.toFixed(2)
          ];
        });
    } else {
      headers = [
        "Name",
        "Part Number",
        "Description",
        "Project Name",
        "Test Area",
        "Unit Price",
        "Total Quantity Used",
        "Total Spending",
        "Transaction Count",
        "Date Range"
      ];

      const spendingByItem = calculateSpendingByItem();
      rows = spendingByItem.map((item) => [
        item.item_name,
        item.part_number,
        item.description,
        item.project_name,
        item.test_area,
        item.unit_price,
        item.total_quantity,
        item.total_spending.toFixed(2),
        item.transaction_count,
        item.date_range || "N/A"
      ]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `spending_report_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInventory = inventory.filter(item => {
    const price = parseFloat(item.item_unit_price?.replace(/[^0-9.]/g, '') || 0);
    return price > 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Spending Report</h1>
      </div>

      {/* FILTERS AND VIEW MODE */}
      <div className="max-w-7xl mx-auto px-8 mb-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Name:</label>
              <div className="relative" ref={projectRef}>
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    setShowProjectDropdown(true);
                  }}
                  onFocus={() => setShowProjectDropdown(true)}
                  placeholder="Search with Dropdown"
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm pr-20 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {projectName && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectName("");
                        setProjectSearch("");
                        setShowProjectDropdown(false);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        showProjectDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {showProjectDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto z-50 transition-colors">
                    {filteredProjects.length === 0 ? (
                      <div className="p-3 text-gray-500 dark:text-gray-400">No matches found</div>
                    ) : (
                      filteredProjects.map((project) => (
                        <div
                          key={project}
                          onClick={() => {
                            setProjectName(project);
                            setProjectSearch(project);
                            setShowProjectDropdown(false);
                          }}
                          className={`p-3 border-b dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 ${
                            projectName === project ? "bg-blue-100 dark:bg-gray-600" : ""
                          }`}
                        >
                          {project}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Test Area:</label>
              <div className="relative" ref={testAreaRef}>
                <input
                  type="text"
                  value={testAreaSearch}
                  onChange={(e) => {
                    setTestAreaSearch(e.target.value);
                    setShowTestAreaDropdown(true);
                  }}
                  onFocus={() => setShowTestAreaDropdown(true)}
                  placeholder="Search with Dropdown"
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm pr-20 transition-colors"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {testArea && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTestArea("");
                        setTestAreaSearch("");
                        setShowTestAreaDropdown(false);
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowTestAreaDropdown(!showTestAreaDropdown)}
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-200 ${
                        showTestAreaDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {showTestAreaDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-60 overflow-y-auto z-50 transition-colors">
                    {filteredTestAreas.length === 0 ? (
                      <div className="p-3 text-gray-500 dark:text-gray-400">No matches found</div>
                    ) : (
                      filteredTestAreas.map((area) => (
                        <div
                          key={area}
                          onClick={() => {
                            setTestArea(area);
                            setTestAreaSearch(area);
                            setShowTestAreaDropdown(false);
                          }}
                          className={`p-3 border-b dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 ${
                            testArea === area ? "bg-blue-100 dark:bg-gray-600" : ""
                          }`}
                        >
                          {area}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">View Mode:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm transition-colors"
              >
                <option value="inventory">Current Inventory Value</option>
                <option value="transactions">Spending by Transactions</option>
              </select>
            </div>
          </div>

          {/* Date Filters - Only show for transactions view */}
          {viewMode === "transactions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm transition-colors"
                />
              </div>
            </div>
          )}

          {/* SUMMARY CARD */}
          {!loading && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4 transition-colors">
              {viewMode === "inventory" ? (
                <>
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-400">
                    Total Inventory Value: ${calculateTotalInventoryValue().toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {filteredInventory.length} items with pricing information
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-400">
                    Total Spending: ${calculateTotalSpending().toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Net spending (requests - returns) from {transactions.length} transactions
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="max-w-7xl mx-auto px-8 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {viewMode === "inventory" ? "Current Inventory Value by Item" : "Spending Summary by Item"}
            </h2>
            <button
              onClick={downloadCSV}
              disabled={loading || (viewMode === "inventory" ? filteredInventory.length === 0 : transactions.length === 0)}
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 shadow disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Download CSV
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : viewMode === "transactions" && transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No transaction data found.</p>
          ) : viewMode === "inventory" ? (
            filteredInventory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No inventory items with pricing information found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Name</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Part Number</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Description</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Project Name</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Test Area</th>
                      <th className="p-3 text-right text-gray-700 dark:text-gray-300">Current Quantity</th>
                      <th className="p-3 text-right text-gray-700 dark:text-gray-300">Unit Price</th>
                      <th className="p-3 text-right text-gray-700 dark:text-gray-300">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const price = parseFloat(item.item_unit_price?.replace(/[^0-9.]/g, '') || 0);
                      const quantity = item.item_current_quantity || 0;
                      const totalValue = price * quantity;
                      return (
                        <tr
                          key={item.item_id}
                          onClick={() => setSelectedItemId(item.item_id)}
                          className={`border-b dark:border-gray-700 cursor-pointer transition-colors ${
                            selectedItemId === item.item_id
                              ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <td className={`p-3 font-medium text-gray-800 dark:text-gray-200 ${selectedItemId === item.item_id ? "text-blue-700 dark:text-blue-400 font-bold" : ""}`}>
                            {item.item_name}
                          </td>
                          <td className="p-3 text-gray-800 dark:text-gray-200">{item.item_part_number || "N/A"}</td>
                          <td className="p-3 max-w-xs text-gray-800 dark:text-gray-200">{item.item_description || "N/A"}</td>
                          <td className="p-3 text-gray-800 dark:text-gray-200">{item.project_name || "N/A"}</td>
                          <td className="p-3 text-gray-800 dark:text-gray-200">{item.test_area || "N/A"}</td>
                          <td className="p-3 text-right text-gray-800 dark:text-gray-200">{quantity}</td>
                          <td className="p-3 text-right text-gray-800 dark:text-gray-200">{item.item_unit_price || "N/A"}</td>
                          <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                            ${totalValue.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No transaction data found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Name</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Part Number</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Description</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Project Name</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Test Area</th>
                    <th className="p-3 text-right text-gray-700 dark:text-gray-300">Unit Price</th>
                    <th className="p-3 text-right text-gray-700 dark:text-gray-300">Total Quantity Used</th>
                    <th className="p-3 text-right text-gray-700 dark:text-gray-300">Total Spending</th>
                    <th className="p-3 text-right text-gray-700 dark:text-gray-300">Transaction Count</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Date Range</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateSpendingByItem().map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{item.item_name}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{item.part_number}</td>
                      <td className="p-3 max-w-xs text-gray-800 dark:text-gray-200">{item.description}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{item.project_name}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{item.test_area}</td>
                      <td className="p-3 text-right text-gray-800 dark:text-gray-200">{item.unit_price}</td>
                      <td className="p-3 text-right text-gray-800 dark:text-gray-200">{item.total_quantity}</td>
                      <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                        ${item.total_spending.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-800 dark:text-gray-200">{item.transaction_count}</td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{item.date_range || "N/A"}</td>
                    </tr>
                  ))}
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
          onClick={() => navigate("/dashboard/reports")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

