import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function ReturnItemPage() {
  const { transaction_id } = useParams();
  const navigate = useNavigate();

  const [tx, setTx] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [userName, setUserName] = useState("");
  const [employeeId, setEmployeeId] = useState(null);

  // Load token info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.user_name);
      setEmployeeId(payload.employee_id);
    }
  }, []);

  // Load transaction details
  useEffect(() => {
    API.get(`/transactions/${transaction_id}`)
      .then((res) => {
        console.log("Transaction APT response:", res.data);
        setTx(res.data)
      })
      .catch((err) => console.error("Error loading transaction details:", err));
  }, [transaction_id]);

  const submitReturn = async () => {
    if (!quantity) {
      alert("Enter return quantity");
      return;
    }

    console.log("Sending return body:", {
      item_id: tx.item_id,
      employee_id: employeeId,
      fixture_id: tx.fixture_id,
      quantity_used: Number(quantity),
      remarks: remarks || null,
      transaction_type: "return",
      test_area: tx.test_area,
      project_name: tx.project_name,

    });

    

    try {
      await API.post("/transactions/return", {
        item_id: tx.item_id,
        employee_id: employeeId,
        fixture_id: tx.fixture_id,
        quantity_used: Number(quantity),
        remarks: remarks || null,
        transaction_type: "return",
        test_area: tx.test_area,
        project_name: tx.project_name,
      });

      alert("Return successful!");
      navigate("/dashboard/return");

    } catch (err) {
      console.error(err);
      alert("Return failed");
    }
  };

  if (!tx) return <h2 className="text-center mt-10">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP BAR */}
      <div className="w-full bg-white shadow-sm p-4 flex justify-between items-center">
        <span
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          MMIS
        </span>
        <span className="text-lg font-semibold text-gray-700">
          {userName}
        </span>
      </div>

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Return</h1>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 border rounded-xl shadow">

        {/* TRANSACTION BOX */}
        <div className="border p-4 rounded-xl bg-gray-50 mb-8">
            <h2 className="text-2xl text-center font-bold mb-2">{tx.item_name}</h2>

            <p><strong>Description:</strong> {tx.item_description || "N/A"}</p>
            <p><strong>Part Number:</strong> {tx.item_part_number || "N/A"}</p>
            <p><strong>Manufacturer:</strong> {tx.item_manufacturer || "N/A"}</p>

            <p><strong>Fixture:</strong> {tx.fixture_name || "N/A"}</p>
            <p><strong>Quantity Taken:</strong> {tx.quantity_used}</p>
            <p><strong>Date Requested:</strong> {tx.created_at.substring(0, 10)}</p>
        </div>

        {/* RETURN QUANTITY */}
        <label className="font-semibold text-gray-700">Return Quantity</label>
        <input
          type="number"
          min="1"
          max={tx.quantity_used}
          className="border p-2 rounded w-full mb-6"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={`Enter quantity (max ${tx.quantity_used})`}
        />

        {/* REMARKS */}
        <label className="font-semibold text-gray-700">Remarks (Optional)</label>
        <input
          type="text"
          className="border p-2 rounded w-full mb-8"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Any notes..."
        />

        {/* BUTTONS */}
        <div className="flex justify-center gap-6">
          <button
            className="px-8 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <button
            className="px-8 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={submitReturn}
          >
            Submit Return
          </button>
        </div>

      </div>

    </div>
  );
}
