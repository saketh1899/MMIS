import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import AccessDenied from "../components/AccessDenied";
import Header from "../components/Header";

export default function RestockEditFixturePage() {
  const { fixture_id } = useParams();
  const navigate = useNavigate();

  const [fixture, setFixture] = useState(null);
  const [formData, setFormData] = useState({
    fixture_id: "",
    fixture_name: "",
    test_area: "",
    project_name: "",
    asset_tag: "",
    fixture_serial_number: "",
  });
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
    "Common",
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

  // Filtered options for dropdowns
  const filteredProjects = projects.filter(project =>
    project.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredTestAreas = testAreas.filter(area =>
    area.toLowerCase().includes(testAreaSearch.toLowerCase())
  );

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
    setLoading(false);
  }, []);

  // Load fixture details
  useEffect(() => {
    if (!fixture_id) return;
    
    API.get(`/fixtures/${fixture_id}`)
      .then((res) => {
        const fixtureData = res.data;
        setFixture(fixtureData);
        setFormData({
          fixture_id: fixtureData.fixture_id || "",
          fixture_name: fixtureData.fixture_name || "",
          test_area: fixtureData.test_area || "",
          project_name: fixtureData.project_name || "",
          asset_tag: fixtureData.asset_tag || "",
          fixture_serial_number: fixtureData.fixture_serial_number || "",
        });
        setProjectSearch(fixtureData.project_name || "");
        setTestAreaSearch(fixtureData.test_area || "");
      })
      .catch((err) => console.error("Error loading fixture:", err));
  }, [fixture_id]);

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

  // Check if user is admin
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>;
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

  const handleUpdate = async () => {
    if (!formData.fixture_name) {
      alert("Please fill in Fixture Name");
      return;
    }
    if (!formData.project_name) {
      alert("Please fill in Project Name");
      return;
    }
    if (!formData.test_area) {
      alert("Please fill in Test Area");
      return;
    }
    if (!formData.asset_tag) {
      alert("Please fill in Asset Tag");
      return;
    }
    if (!formData.fixture_serial_number) {
      alert("Please fill in Fixture Serial Number");
      return;
    }

    try {
      await API.put(`/fixtures/${fixture_id}`, {
        fixture_name: formData.fixture_name,
        project_name: formData.project_name,
        test_area: formData.test_area,
        asset_tag: formData.asset_tag,
        fixture_serial_number: formData.fixture_serial_number,
      });

      alert("Fixture updated successfully!");
      navigate("/dashboard/reports/current-inventory");
    } catch (err) {
      console.error(err);
      alert("Failed to update fixture: " + (err.response?.data?.detail || err.message));
    }
  };

  if (!fixture) return <h2 className="text-center mt-10">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Edit Fixture</h1>
      </div>

      <div className="max-w-2xl mx-auto px-8">
        {/* FORM */}
        <div className="bg-white border rounded-xl shadow-lg p-8 mb-8">
          <div className="space-y-6">
            {/* Fixture ID - Read Only */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Fixture ID</label>
              <input
                type="text"
                value={formData.fixture_id}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

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

            {/* Asset Tag */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Asset Tag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="asset_tag"
                value={formData.asset_tag}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter asset tag"
              />
            </div>

            {/* Fixture Serial Number */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Fixture Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fixture_serial_number"
                value={formData.fixture_serial_number}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter fixture serial number"
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            className="px-8 py-3 bg-blue-200 text-blue-800 rounded-md hover:bg-blue-300 shadow-md font-medium transition-colors"
            onClick={() => navigate("/dashboard/reports/current-inventory")}
          >
            Back
          </button>

          <button
            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-md font-medium transition-colors"
            onClick={handleUpdate}
          >
            Update Fixture
          </button>
        </div>
      </div>
    </div>
  );
}

