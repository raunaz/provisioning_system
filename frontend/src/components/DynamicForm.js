import { useState, useEffect } from "react";
import axios from "axios";

const DynamicForm = () => {
  const [serverType, setServerType] = useState("aws");
  const [formData, setFormData] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/history").then((res) => setHistory(res.data));
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("http://localhost:5000/provision", {
        serverType,
        ...formData,
      });
      setMessage("Provisioning started successfully.");
      fetchHistory(); // Refresh history
    } catch (error) {
      setMessage("Provisioning failed. Please check logs.");
      console.error("Provisioning error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-maybankYellow min-h-screen p-10 text-maybankBlack">
      <h2 className="text-3xl font-bold mb-4">Provision Server</h2>
      
      {/* Dynamic Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <label className="block mb-2 font-semibold">Select Environment:</label>
        <select 
          name="serverType" 
          value={serverType} 
          onChange={(e) => setServerType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="aws">AWS</option>
          <option value="vmware">VMware</option>
        </select>

        {serverType === "aws" ? (
          <>
            <label className="block mb-2 font-semibold">Instance Type:</label>
            <input
              type="text"
              name="instanceType"
              placeholder="e.g., t2.micro"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              required
            />

            <label className="block mb-2 font-semibold">AMI ID:</label>
            <input
              type="text"
              name="ami"
              placeholder="e.g., ami-12345678"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              required
            />
          </>
        ) : (
          <>
            <label className="block mb-2 font-semibold">vCenter Host:</label>
            <input
              type="text"
              name="vcenterHost"
              placeholder="e.g., vcenter.example.com"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              required
            />

            <label className="block mb-2 font-semibold">Datastore:</label>
            <input
              type="text"
              name="datastore"
              placeholder="e.g., datastore1"
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              required
            />
          </>
        )}

        <button
          type="submit"
          className="bg-maybankBlack text-white py-2 px-4 rounded hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "Provisioning..." : "Provision"}
        </button>
      </form>

      {message && <p className="mt-4 text-lg font-semibold">{message}</p>}

      {/* Provisioning History */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-4">Provisioning History</h3>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {history.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b font-semibold">
                  <th className="p-2 text-left">Environment</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{entry.serverType.toUpperCase()}</td>
                    <td className={`p-2 font-semibold ${entry.status === "Completed" ? "text-green-600" : "text-red-600"}`}>
                      {entry.status}
                    </td>
                    <td className="p-2">{new Date(entry.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No provisioning history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;
