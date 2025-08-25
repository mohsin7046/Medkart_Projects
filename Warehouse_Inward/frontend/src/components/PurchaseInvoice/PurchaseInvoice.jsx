import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiTrash2 } from "react-icons/fi";

function PurchaseInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/purchase-invoice/get-pi");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching purchase invoices:", error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (invoice_number) => {
    if (window.confirm("Are you sure you want to delete this Purchase Invoice?")) {
      try {
        const response = await fetch(`http://localhost:3000/purchase-invoice/delete-pi`, {
          method: "DELETE",
           headers: { "Content-Type": "application/json" },
          body: JSON.stringify({invoice_number})
        });
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete Invoice");
          return;
        }
        setInvoices((prev) => prev.filter((inv) => inv.invoice_number !== invoice_number));
      } catch (error) {
        console.error("Error deleting Invoice:", error);
      }
    }
  };



  return (
    <div>
      
      <div className="bg-white shadow-md p-4 rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Invoice Number</th>
              <th className="border px-4 py-2">GRN Number</th>
              <th className="border px-4 py-2">Invoice Date</th>
              <th className="border px-4 py-2">Total Amount</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length > 0 ? (
              invoices.map((inv, idx) => (
                <tr key={inv.id} className="text-center">
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{inv.invoice_number}</td>
                  <td className="border px-4 py-2">{inv.grn_number}</td>
                  <td className="border px-4 py-2">
                    {new Date(inv.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">₹{inv.total_amount}</td>
                  <td className="border px-4 py-2">{inv.status}</td>
                  <td className="border px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/purchase-invoice/view/${inv.id}`, { state: { invoice: inv } })
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="text-blue-600" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(inv.invoice_number)}
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiTrash2 className="text-red-700" size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No Purchase Invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PurchaseInvoiceList;
