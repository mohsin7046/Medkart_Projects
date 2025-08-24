import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2,FiEye } from "react-icons/fi";

function GRNList() {
  const [grns, setGrns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/grn/get-grn");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setGrns(data);
      } catch (error) {
        console.error("Error fetching GRN:", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (grn_number) => {
    if (window.confirm("Are you sure you want to delete this GRN?")) {
      try {
        const response = await fetch(`http://localhost:3000/grn/delete-grn`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grn_number:grn_number}),
        });
        if (!response.ok){
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete GRN");
          return;
        }
        setGrns((prev) => prev.filter((g) => g.grn_number !== grn_number));
      } catch (error) {
        console.error("Error deleting GRN:", error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Goods Receipt Notes</h2>

      <div className="bg-white shadow-md p-4 rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">GRN Number</th>
              <th className="border px-4 py-2">Order Number</th>
              <th className="border px-4 py-2">Received Date</th>
              <th className="border px-4 py-2">Total Amount</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {grns.length > 0 ? (
              grns.map((grn, idx) => (
                <tr key={grn.id} className="text-center">
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{grn.grn_number}</td>
                  <td className="border px-4 py-2">{grn.order_number}</td>
                  <td className="border px-4 py-2">
                    {new Date(grn.received_date).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">₹{grn.total_amount}</td>
                  <td className="border px-4 py-2">{grn.status}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() =>
                        navigate(`/grn/edit/${grn.id}`, { state: { grn: g } })
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEdit className="text-green-600" size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(grn.grn_number)}
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiTrash2 className="text-red-700" size={18} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/grn/view/${grn.id}`, { state: { grn } })
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="text-blue-600" size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No GRNs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GRNList;
