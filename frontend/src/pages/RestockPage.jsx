import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RestockPage() {
  const navigate = useNavigate();
  
  // Redirect to project selection page
  useEffect(() => {
    navigate("/dashboard/restock/project", { replace: true });
  }, [navigate]);

  return null;
}
