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
  const [showImageModal, setShowImageModal] = useState(false);

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
      request_transaction_id: tx.transaction_id, // Link this return to the specific request transaction
    });

    try {
      // Send request_transaction_id as a query parameter to link the return to the specific request
      await API.post(`/transactions/return?request_transaction_id=${tx.transaction_id}`, {
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

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Get API base URL (same logic as api.js)
    const apiBaseUrl = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD ? '/api' : 'http://127.0.0.1:8000');
    // Prepend the API base URL
    return `${apiBaseUrl}${imageUrl}`;
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
          <div className="flex gap-6">
            {/* Item Image */}
            <div className="flex-shrink-0 relative">
              {getImageUrl(tx.item_image_url) ? (
                <div className="relative group">
                  <img 
                    src={getImageUrl(tx.item_image_url)} 
                    alt={tx.item_name || `Item #${tx.item_id}`}
                    className="w-[500px] h-[500px] object-contain rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700 p-4 cursor-pointer hover:shadow-2xl transition-all duration-200 hover:scale-105"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  {/* Zoom indicator */}
                  <div className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center font-medium">Click to enlarge</p>
                </div>
              ) : null}
              <div 
                className="w-[500px] h-[500px] bg-gray-200 dark:bg-gray-600 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-base shadow-lg"
                style={{ display: getImageUrl(tx.item_image_url) ? 'none' : 'flex' }}
              >
                No Image
              </div>
            </div>
            
            {/* Item Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">{tx.item_name || `Item #${tx.item_id}`}</h2>
              <div className="space-y-2">
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
            </div>
          </div>
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

      {/* Image Modal */}
      {showImageModal && getImageUrl(tx.item_image_url) && (
        <div 
          className="fixed inset-0 bg-black/80 dark:bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10 shadow-lg"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={getImageUrl(tx.item_image_url)} 
              alt={tx.item_name || `Item #${tx.item_id}`}
              className="w-full h-full object-contain rounded-lg bg-white dark:bg-gray-800 p-4"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-4 text-lg font-semibold">{tx.item_name || `Item #${tx.item_id}`}</p>
          </div>
        </div>
      )}

    </div>
  );
}
