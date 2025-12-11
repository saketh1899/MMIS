import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Header from "../components/Header";

export default function ReturnItemPage() {
  const { transaction_id } = useParams();
  const navigate = useNavigate();

  const [tx, setTx] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [quantityError, setQuantityError] = useState("");

  // Load token info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
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

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    // Use remaining_quantity if available, otherwise fall back to quantity_used
    const maxQuantity = tx ? (tx.remaining_quantity !== undefined ? tx.remaining_quantity : tx.quantity_used) : 0;

    if (value === "") {
      setQuantity("");
      setQuantityError("");
      return;
    }

    if (isNaN(numValue) || numValue <= 0) {
      setQuantityError("Quantity must be greater than 0");
      setQuantity(value);
      return;
    }

    if (numValue > maxQuantity) {
      setQuantityError(`Cannot return more than ${maxQuantity} (quantity taken)`);
      setQuantity(value); // Allow typing but show error
      return;
    }

    setQuantity(value);
    setQuantityError("");
  };

  const handleQuantityBlur = (e) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    // Use remaining_quantity if available, otherwise fall back to quantity_used
    const maxQuantity = tx ? (tx.remaining_quantity !== undefined ? tx.remaining_quantity : tx.quantity_used) : 0;

    // Clamp value to max when user leaves the field
    if (value && numValue > maxQuantity) {
      setQuantity(maxQuantity.toString());
      setQuantityError("");
    }
  };

  const submitReturn = async () => {
    if (!quantity) {
      alert("Enter return quantity");
      return;
    }

    const numQuantity = parseFloat(quantity);
    // Use remaining_quantity if available, otherwise fall back to quantity_used
    const maxQuantity = tx ? (tx.remaining_quantity !== undefined ? tx.remaining_quantity : tx.quantity_used) : 0;

    if (isNaN(numQuantity) || numQuantity <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    if (numQuantity > maxQuantity) {
      alert(`Cannot return more than ${maxQuantity} items. You only took ${maxQuantity} items.`);
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
      <Header />

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
            {tx.remaining_quantity !== undefined && tx.remaining_quantity !== tx.quantity_used && (
              <p><strong>Remaining to Return:</strong> {tx.remaining_quantity}</p>
            )}
            <p><strong>Date Requested:</strong> {tx.created_at.substring(0, 10)}</p>
        </div>

        {/* RETURN QUANTITY */}
        <label className="font-semibold text-gray-700">Return Quantity</label>
        <input
          type="number"
          min="1"
          max={tx.remaining_quantity !== undefined ? tx.remaining_quantity : tx.quantity_used}
          step="1"
          className={`border p-2 rounded w-full mb-2 ${quantityError ? "border-red-500" : ""}`}
          value={quantity}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur}
          placeholder={`Enter quantity (max ${tx.remaining_quantity !== undefined ? tx.remaining_quantity : tx.quantity_used})`}
        />
        {quantityError && (
          <p className="text-red-500 text-sm mb-4">{quantityError}</p>
        )}
        {!quantityError && (
          <p className="text-gray-500 text-sm mb-4">
            Maximum returnable: {tx.quantity_used} items
          </p>
        )}

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
