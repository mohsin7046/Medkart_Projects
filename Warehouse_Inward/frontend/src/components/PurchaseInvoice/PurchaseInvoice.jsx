import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiTrash2 } from "react-icons/fi";

function PurchaseInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("invoice_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d"); 
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page,
          limit,
          sortby: `${sortField},${sortOrder}`,
        });

        if (searchTerm) params.append("search", searchTerm);
        if (statusFilter !== "all") params.append("status", statusFilter);
        params.append("name", "invoice"); 
        if (searchField) params.append("field", searchField);

        const response = await fetch(
          `http://localhost:3000/api/v1/purchase-invoice?${params.toString()}`
        );

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        setInvoices(data.data?.data || []);
        setMetadata(data.data?.metadata || {});
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };
    fetchData();
  }, [page, searchTerm, searchField, statusFilter, sortField, sortOrder]);

  const handleDelete = (invoice_number) => async () => {
    if (window.confirm("Are you sure you want to delete this Purchase Invoice?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/purchase-invoice`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invoice_number }),
          }
        );

        if (!response.ok) {
          const err = await response.json();
          alert(err.error || "Failed to delete Invoice");
          return;
        }

        setInvoices((prev) => prev.filter((i) => i.invoice_number !== invoice_number));
        alert("Invoice deleted successfully");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice");
      }
    }
  };

  return (
    <div>
      
      <div className="bg-white shadow-md p-4 rounded-md mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1 rounded-md w-52"
          />

          
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="invoice_number">Invoice Number</option>
    
          </select>

      
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

        
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="created_at">Created At</option>
            <option value="updated_at">Updated At</option>
            <option value="invoice_date">Invoice Date</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="a">Ascending</option>
            <option value="d">Descending</option>
          </select>
        </div>
      </div>

   
      <div className="bg-white shadow-md p-4 rounded-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">IDX</th>
              <th className="border px-4 py-2">Invoice Number</th>
              <th className="border px-4 py-2">GRN ID</th>
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
                  <td className="border px-4 py-2">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="border px-4 py-2">{inv.invoice_number}</td>
                  <td className="border px-4 py-2">{inv.grn_id}</td>
                  <td className="border px-4 py-2">
                    {new Date(inv.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">₹{inv.total_amount}</td>
                  <td className="border px-4 py-2">{inv.status}</td>
                  <td className="border px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/purchase-invoice/view/${inv.id}`, {
                          state: { invoice: inv },
                        })
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiEye className="text-blue-600" size={18} />
                    </button>
                    <button
                      onClick={handleDelete(inv.invoice_number)}
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

      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={!metadata.page || page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {metadata.page || 1} of {metadata.totalPages || 1}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= (metadata.totalPages || 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PurchaseInvoiceList;
