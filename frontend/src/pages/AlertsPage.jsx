import Layout from "../components/Layout";

export default function AlertsPage() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Low Stock Alerts</h2>

      <div className="space-y-3">
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded">
          Screw M3x10 — Only 12 left!
        </div>
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded">
          Cooling Fan — Only 4 left!
        </div>
      </div>
    </Layout>
  );
}
