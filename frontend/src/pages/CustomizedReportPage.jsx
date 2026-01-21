import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";
import { getProjects } from "../utils/projects";

export default function CustomizedReportPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [testArea, setTestArea] = useState("");
  const [projectName, setProjectName] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Dropdown states
  const [showTestAreaDropdown, setShowTestAreaDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [testAreaSearch, setTestAreaSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const testAreaRef = useRef(null);
  const projectRef = useRef(null);

  // Options
  const testAreas = [
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
    "TOOLS",
  ];

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

  // Filtered options
  const filteredTestAreas = testAreas.filter(area =>
    area.toLowerCase().includes(testAreaSearch.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (testAreaRef.current && !testAreaRef.current.contains(event.target)) {
        setShowTestAreaDropdown(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync search with selected values
  useEffect(() => {
    if (testArea) {
      setTestAreaSearch(testArea);
    }
  }, [testArea]);

  useEffect(() => {
    if (projectName) {
      setProjectSearch(projectName);
    }
  }, [projectName]);

  const generateReport = () => {
    setLoading(true);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (testArea) params.append("test_area", testArea);
    if (projectName) params.append("project", projectName);
    if (transactionType) params.append("transaction_type", transactionType);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const url = `/transactions/all${params.toString() ? "?" + params.toString() : ""}`;
    
    API.get(url)
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => {
        console.error("Error generating report:", err);
        alert("Failed to generate report");
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  };

  const downloadCSV = () => {
    if (transactions.length === 0) {
      alert("No data to download. Please generate a report first.");
      return;
    }

    // CSV Headers
    const headers = [
      "Transaction ID",
      "Date & Time",
      "Transaction Type",
      "Employee Name",
      "Item Name",
      "Part Number",
      "Description",
      "Quantity",
      "Fixture",
      "Test Area",
      "Project Name"
    ];

    // CSV Rows
    const rows = transactions.map((tx) => [
      tx.transaction_id || "",
      new Date(tx.created_at).toLocaleString(),
      tx.transaction_type || "",
      tx.employee_name || "",
      tx.item_name || "",
      tx.item_part_number || "",
      tx.item_description || "",
      tx.quantity_used || 0,
      tx.fixture_name || "",
      tx.test_area || "",
      tx.project_name || ""
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customized_report_${new Date().toISOString().split('T')[0]}.csv`);
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
        <h1 className="text-3xl font-bold">Customized Report</h1>
      </div>


      {/* FILTER FORM */}
      <div className="max-w-4xl mx-auto px-8 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors">
          <div className="space-y-4">
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
                      title="Clear selection"
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
                      title="Clear selection"
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Transaction Type:</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded shadow-sm transition-colors"
              >
                <option value="">All Types</option>
                <option value="request">Request</option>
                <option value="return">Return</option>
                <option value="restock">Restock</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => navigate("/dashboard/reports")}
              className="px-8 py-2 bg-blue-200 dark:bg-blue-700 dark:text-white rounded hover:bg-blue-300 dark:hover:bg-blue-600 shadow transition-colors"
            >
              Back
            </button>
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-8 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 shadow disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      {transactions.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Report Results ({transactions.length} transactions)</h2>
              <button
                onClick={downloadCSV}
                className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 shadow transition-colors"
              >
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Date</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Type</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Employee</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Item</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Part Number</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Quantity</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Fixture</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Test Area</th>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr 
                      key={tx.transaction_id} 
                      onClick={() => setSelectedTransactionId(tx.transaction_id)}
                      className={`border-b dark:border-gray-700 cursor-pointer transition-colors ${
                        selectedTransactionId === tx.transaction_id 
                          ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <td className="p-3 text-gray-800 dark:text-gray-200">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{tx.transaction_type}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{tx.employee_name}</td>
                      <td className={`p-3 text-gray-800 dark:text-gray-200 ${selectedTransactionId === tx.transaction_id ? "text-blue-700 dark:text-blue-400 font-bold" : ""}`}>{tx.item_name || "N/A"}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{tx.item_part_number || "N/A"}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{tx.quantity_used}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{tx.fixture_name || "N/A"}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{tx.test_area || "N/A"}</td>
                      <td className="p-3 text-gray-800 dark:text-gray-200">{tx.project_name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

