// src/pages/RequestProjectPage.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { getProjects } from "../utils/projects";

export default function RequestProjectPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
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

  // Filter projects based on search input
  const filteredProjects = projects.filter((project) =>
    project.toLowerCase().includes(searchInput.toLowerCase().trim())
  );

  // Projects that skip test area selection
  const skipTestAreaProjects = ["Hi-Lo", "Flying Probe"];

  // Handle project selection - skip test area for specific projects
  const handleProjectClick = (project) => {
    if (skipTestAreaProjects.includes(project)) {
      // Navigate directly to items page without test_area
      navigate(`/dashboard/request/search?project=${encodeURIComponent(project)}`);
    } else {
      // Navigate to test area selection page
      navigate(`/dashboard/request/test-area?project=${encodeURIComponent(project)}`);
    }
  };

    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 dark:bg-blue-800 text-white text-center py-4 mb-8 shadow-md transition-colors">
        <h1 className="text-3xl font-bold">Request</h1>
      </div>

      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-6 text-lg">
        Select Project Name
      </p>

      {/* SEARCH BOX */}
      <div className="max-w-5xl mx-auto mb-6 px-8">
        <input
          type="text"
          placeholder="Project Names"
          className="w-full p-3 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded shadow-sm transition-colors"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-4 gap-6 justify-center mx-auto max-w-5xl px-8">
        {filteredProjects.length === 0 ? (
          <div className="col-span-4 text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No projects found matching "{searchInput}"</p>
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div
              key={p}
              onClick={() => handleProjectClick(p)}
              className="border dark:border-gray-700 p-8 text-center rounded-xl bg-white dark:bg-gray-800 cursor-pointer 
                         hover:bg-blue-100 dark:hover:bg-gray-700 hover:shadow-lg transition-all shadow-md"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{p}</span>
            </div>
          ))
        )}
      </div>

      {/* BACK BUTTON */}
      <div className="flex justify-center mt-12">
        <button
          className="px-8 py-2 bg-gray-300 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 shadow transition-colors"
          onClick={() => navigate("/dashboard")}
        >
          Back
        </button>
      </div>
    </div>
  );
}