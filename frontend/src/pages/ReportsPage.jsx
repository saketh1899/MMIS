// import Layout from "../components/Layout";

// export default function ReportsPage() {
//   return (
//     <Layout>
//       <h2 className="text-2xl font-bold mb-6">Weekly Usage Reports</h2>

//       <table className="w-full bg-white shadow rounded-lg">
//         <thead>
//           <tr className="bg-gray-100 border-b">
//             <th className="p-3 text-left">Item</th>
//             <th className="p-3 text-left">Used</th>
//             <th className="p-3 text-left">Remaining</th>
//             <th className="p-3 text-left">Week</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border-b hover:bg-gray-50">
//             <td className="p-3">Screw M3x10</td>
//             <td className="p-3">50</td>
//             <td className="p-3">480</td>
//             <td className="p-3">Oct 27 – Nov 02</td>
//           </tr>
//         </tbody>
//       </table>
//     </Layout>
//   );
// }
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api";
import { useSearchParams } from "react-router-dom";

export default function RequestPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [params] = useSearchParams();
  const project = params.get("project");
  const test_area = params.get("test_area");

  // Load items from backend
  useEffect(() => {
    API.get(`/inventory?project=${project}&test_area=${test_area}`)
      .then(res => setItems(res.data))
      .catch(err => console.error("Error loading items:", err));
  }, [project, test_area]);

  const handleRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));

      await API.post("/inventory/request", {
        item_id: selectedItem,
        quantity: quantity,
        employee_id: payload.employee_id
      });

      alert("Request submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Request Inventory</h2>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">

        <p className="mb-4 text-gray-700">
          <strong>Project:</strong> {project} <br />
          <strong>Test Area:</strong> {test_area}
        </p>

        <label className="block mb-2 font-semibold">Select Item</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">Select item...</option>
          {items.map((item) => (
            <option key={item.item_id} value={item.item_id}>
              {item.item_name}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Quantity</label>
        <input
          type="number"
          className="w-full p-2 border rounded mb-4"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <button
          onClick={handleRequest}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>
      </div>
    </Layout>
  );
}