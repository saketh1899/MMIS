// src/pages/RequestProjectPage.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import PageHeaderWithBack from "../components/PageHeaderWithBack";
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
  const skipTestAreaProjects = ["Hi-Lo", "Flying Probe", "Development"];

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
    <div className="min-h-screen bg-transparent transition-colors">
      <Header />

      <PageHeaderWithBack title="Request" onBack={() => navigate("/dashboard")} />

      <p className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-6 text-lg">
        Select Project Name
      </p>

      {/* SEARCH BOX */}
      <div className="max-w-5xl mx-auto mb-6 px-8">
        <input
          type="text"
          placeholder="Project Names"
          className="w-full p-3 border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg shadow-sm transition-all"
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
    </div>
  );
}