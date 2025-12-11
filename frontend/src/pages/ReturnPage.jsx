import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";

export default function ReturnPage() {
  const [transactions, setTransactions] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load employee info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmployeeId(payload.employee_id);
    }
  }, []);

  // Fetch user's active transactions
  const fetchTransactions = () => {
    if (!employeeId) return;

    API.get(`/transactions/user/${employeeId}`)
      .then((res) => {
        console.log("Fetched transactions:", res.data);
        // Log each transaction's remaining quantity calculation
        res.data.forEach(tx => {
          console.log(`Transaction ${tx.transaction_id}: Requested=${tx.quantity_used}, Remaining=${tx.remaining_quantity}`);
        });
        setTransactions(res.data);
      })
      .catch((err) => console.error("Error fetching transactions:", err));
  };

  useEffect(() => {
    fetchTransactions();
  }, [employeeId, location.pathname]); // Refetch when location changes (e.g., navigating back)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* BLUE HEADER */}
      <div className="w-full bg-blue-600 text-white text-center py-4 mb-8 shadow-md">
        <h1 className="text-3xl font-bold">Return</h1>
      </div>

      <div className="max-w-xl mx-auto px-4">

        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Select an Item to Return
        </h2>

        {/* NO TRANSACTIONS */}
        {transactions.length === 0 && (
          <p className="text-center text-gray-500">
            You have no active items to return.
          </p>
        )}

        {/* SHOW USER'S ACTIVE TRANSACTIONS */}
        <div className="flex flex-col gap-4">
          {transactions.map((tx) => (
            <div
              key={tx.transaction_id}
              onClick={() => navigate(`/dashboard/return/item/${tx.transaction_id}`)}
              className="p-4 bg-white border rounded-xl shadow cursor-pointer hover:bg-blue-100 transition"
            >
              <div className="font-semibold text-lg">{tx.item_name || `Item #${tx.item_id}`}</div>

              <div className="text-gray-600 text-sm">
                {tx.remaining_quantity !== undefined && tx.remaining_quantity !== tx.quantity_used ? (
                  <>
                    <span className="font-semibold">Remaining to Return: {tx.remaining_quantity}</span>
                    <span className="text-gray-500 ml-2">(of {tx.quantity_used} requested)</span>
                  </>
                ) : (
                  <span>Quantity: {tx.quantity_used}</span>
                )}
              </div>

              <div className="text-gray-500 text-sm">
                Requested on: {tx.created_at.substring(0, 10)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button
            className="px-8 py-2 bg-gray-300 rounded hover:bg-gray-400 shadow"
            onClick={() => navigate(`/dashboard`)}
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
}
