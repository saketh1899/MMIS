import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";

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

  const projects = [
    "Astoria",
    "Athena",
    "Turin",
    "Bondi Beach",
    "Zebra Beach",
    "Mandolin Beach",
    "Gulp",
    "Xena",
    "Agora",
    "Humu Beach",
  ];

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>


      {/* FILTER FORM */}
      <div className="max-w-4xl mx-auto px-8 mb-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Test Area:</label>
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
                  className="w-full p-2 border rounded shadow-sm pr-20"
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
                      className="text-gray-400 hover:text-red-600"
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
                    className="text-gray-600 hover:text-black"
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
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto z-50">
                    {filteredTestAreas.length === 0 ? (
                      <div className="p-3 text-gray-500">No matches found</div>
                    ) : (
                      filteredTestAreas.map((area) => (
                        <div
                          key={area}
                          onClick={() => {
                            setTestArea(area);
                            setTestAreaSearch(area);
                            setShowTestAreaDropdown(false);
                          }}
                          className={`p-3 border-b hover:bg-blue-50 cursor-pointer ${
                            testArea === area ? "bg-blue-100" : ""
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">project_name:</label>
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
                  className="w-full p-2 border rounded shadow-sm pr-20"
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
                      className="text-gray-400 hover:text-red-600"
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
                    className="text-gray-600 hover:text-black"
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
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto z-50">
                    {filteredProjects.length === 0 ? (
                      <div className="p-3 text-gray-500">No matches found</div>
                    ) : (
                      filteredProjects.map((project) => (
                        <div
                          key={project}
                          onClick={() => {
                            setProjectName(project);
                            setProjectSearch(project);
                            setShowProjectDropdown(false);
                          }}
                          className={`p-3 border-b hover:bg-blue-50 cursor-pointer ${
                            projectName === project ? "bg-blue-100" : ""
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type:</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full p-2 border rounded shadow-sm"
              >
                <option value="">All Types</option>
                <option value="request">Request</option>
                <option value="return">Return</option>
                <option value="restock">Restock</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => navigate("/dashboard/reports")}
              className="px-8 py-2 bg-blue-200 rounded hover:bg-blue-300 shadow"
            >
              Back
            </button>
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-8 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow disabled:bg-gray-400"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      {transactions.length > 0 && (
        <div className="max-w-6xl mx-auto px-8 mb-8">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Report Results ({transactions.length} transactions)</h2>
              <button
                onClick={downloadCSV}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
              >
                Download CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Part Number</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Fixture</th>
                    <th className="p-3 text-left">Test Area</th>
                    <th className="p-3 text-left">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr 
                      key={tx.transaction_id} 
                      onClick={() => setSelectedTransactionId(tx.transaction_id)}
                      className={`border-b cursor-pointer transition-colors ${
                        selectedTransactionId === tx.transaction_id 
                          ? "bg-blue-100 hover:bg-blue-200" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-3">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="p-3">{tx.transaction_type}</td>
                      <td className="p-3">{tx.employee_name}</td>
                      <td className={`p-3 ${selectedTransactionId === tx.transaction_id ? "text-blue-700 font-bold" : ""}`}>{tx.item_name}</td>
                      <td className="p-3">{tx.item_part_number || "N/A"}</td>
                      <td className="p-3">{tx.quantity_used}</td>
                      <td className="p-3">{tx.fixture_name}</td>
                      <td className="p-3">{tx.test_area || "N/A"}</td>
                      <td className="p-3">{tx.project_name || "N/A"}</td>
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

