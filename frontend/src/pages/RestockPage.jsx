import Layout from "../components/Layout";

export default function RestockPage() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Restock Items</h2>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <label className="block mb-2 font-semibold">Select Item</label>
        <select className="w-full p-2 border rounded mb-4">
          <option>Select item...</option>
        </select>

        <label className="block mb-2 font-semibold">Quantity to Add</label>
        <input type="number" className="w-full p-2 border rounded mb-4" />

        <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Restock
        </button>
      </div>
    </Layout>
  );
}
