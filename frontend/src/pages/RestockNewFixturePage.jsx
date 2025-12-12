// src/pages/RestockNewFixturePage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockNewFixturePage() {
  const navigate = useNavigate();
  const [accessLevel, setAccessLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dropdown states
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTestAreaDropdown, setShowTestAreaDropdown] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [testAreaSearch, setTestAreaSearch] = useState("");
  const projectRef = useRef(null);
  const testAreaRef = useRef(null);

  // Available options for dropdowns
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

  const testAreas = [
    "ICT_Mobo",
    "BSI_Mobo",
    "FBT_Mobo",
    "ICT_Agora",
    "FBT_Agora",
    "TOOLS",
  ];

  const [formData, setFormData] = useState({
    fixture_name: "",
    project_name: "",
    test_area: "",
  });
  const [employeeId, setEmployeeId] = useState(null);

  // Filtered options for dropdowns
  const filteredProjects = projects.filter(project =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredTestAreas = testAreas.filter(area =>
    area.toLowerCase().includes(testAreaSearch.toLowerCase())
  );

  // Load access level and employee_id from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAccessLevel(payload.role);
        setEmployeeId(payload.employee_id);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
    setLoading(false);
  }, []);

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
    if (formData.project_name) {
      setProjectSearch(formData.project_name);
    }
  }, [formData.project_name]);

  useEffect(() => {
    if (formData.test_area) {
      setTestAreaSearch(formData.test_area);
    }
  }, [formData.test_area]);

  // Check if user is admin
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (accessLevel !== "admin") {
    return <AccessDenied feature="the Restock feature" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fixture_name) {
      alert("Please fill in all required fields. Fixture Name is required.");
      return;
    }
    if (!formData.project_name) {
      alert("Please fill in all required fields. Project Name is required.");
      return;
    }
    if (!formData.test_area) {
      alert("Please fill in all required fields. Test Area is required.");
      return;
    }

    try {
      await API.post("/fixtures/", {
        fixture_name: formData.fixture_name,
        project_name: formData.project_name,
        test_area: formData.test_area,
        employee_id: employeeId,  // Include employee_id for activity history
      });

      alert("New fixture added successfully!");
      navigate("/dashboard/restock/project");
    } catch (err) {
      console.error(err);
      alert("Failed to add new fixture");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">New Fixture</h1>
      </div>

      <div className="max-w-2xl mx-auto px-8">
        {/* FORM */}
        <div className="bg-white border rounded-xl shadow-lg p-8 mb-8">
          <div className="space-y-6">
            {/* Project Name - Searchable Dropdown */}
            <div className="relative" ref={projectRef}>
              <label className="block mb-2 font-semibold text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => {
                  setProjectSearch(e.target.value);
                  setShowProjectDropdown(true);
                }}
                onFocus={() => setShowProjectDropdown(true)}
                placeholder="Select Project Name"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showProjectDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((proj) => (
                      <div
                        key={proj}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, project_name: proj }));
                          setProjectSearch(proj);
                          setShowProjectDropdown(false);
                        }}
                        className="p-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                      >
                        {proj}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No project found</div>
                  )}
                </div>
              )}
            </div>

            {/* Test Area - Searchable Dropdown */}
            <div className="relative" ref={testAreaRef}>
              <label className="block mb-2 font-semibold text-gray-700">
                Test Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={testAreaSearch}
                onChange={(e) => {
                  setTestAreaSearch(e.target.value);
                  setShowTestAreaDropdown(true);
                }}
                onFocus={() => setShowTestAreaDropdown(true)}
                placeholder="Select Test Area"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showTestAreaDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredTestAreas.length > 0 ? (
                    filteredTestAreas.map((area) => (
                      <div
                        key={area}
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, test_area: area }));
                          setTestAreaSearch(area);
                          setShowTestAreaDropdown(false);
                        }}
                        className="p-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                      >
                        {area}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No test area found</div>
                  )}
                </div>
              )}
            </div>

            {/* Fixture Name */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Fixture Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fixture_name"
                value={formData.fixture_name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="e.g., Bondi_ICT_01"
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            className="px-8 py-3 bg-blue-200 text-blue-800 rounded-md hover:bg-blue-300 shadow-md font-medium transition-colors"
            onClick={() => navigate("/dashboard/restock/project/add-new")}
          >
            Back
          </button>

          <button
            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-md font-medium transition-colors"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

