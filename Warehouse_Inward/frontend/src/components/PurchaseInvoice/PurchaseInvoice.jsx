import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";

function PurchaseInvoiceList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("invoice_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const {
    data: invoices,
    metadata,
    loading,
    setData: setInvoices,
  } = useFetchData({
    endpoint: ALLEndpoint.PurchaseInvoiceEndpoints.getPurchaseInvoice.endpoint,
    name: "invoice",
    page,
    limit,
    searchTerm,
    searchField,
    statusFilter,
    sortField,
    sortOrder,
  });


  const { deleteItem } = useDeleteData(
        ALLEndpoint.PurchaseInvoiceEndpoints.deletePurchaseInvoice.endpoint,
        ALLEndpoint.PurchaseInvoiceEndpoints.deletePurchaseInvoice.method
      );
    
      const handleDelete = (invoice_id) => {
        console.log(invoice_id);
        
        deleteItem({
          idField: "invoice_id",
          idValue: invoice_id,
          setState: setInvoices,
        });
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
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
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
                    <td className="border px-4 py-2">{(page - 1) * limit + idx + 1}</td>
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
                        onClick={()=>handleDelete(inv.id)}
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
        )}
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
