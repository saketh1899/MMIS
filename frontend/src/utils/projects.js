// Utility to get projects list from localStorage or defaults
// This ensures all pages use the same project list

// Default projects list
export const DEFAULT_PROJECTS = [
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
  "Hi-Lo",
  "Flying Probe",
];

// Get projects from localStorage or use defaults
export const getProjects = () => {
  try {
    const stored = localStorage.getItem("mmis_projects");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults and remove duplicates
      const allProjects = [...new Set([...DEFAULT_PROJECTS, ...parsed])];
      return allProjects.sort();
    }
  } catch (err) {
    console.error("Error loading projects from localStorage:", err);
  }
  return DEFAULT_PROJECTS;
};

// Check if a project is custom (not in default list)
export const isCustomProject = (project) => {
  return !DEFAULT_PROJECTS.includes(project);
};

