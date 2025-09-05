import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { ALLEndpoint } from "../../constant/endPoints";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";

function GRNList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("grn_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const { data: grns, metadata, loading, setData: setGrns } = useFetchData({
    endpoint: ALLEndpoint.GRNEndpoints.getGRN.endpoint,
    name: "grn",
    page,
    limit,
    searchTerm,
    searchField,
    statusFilter,
    sortField,
    sortOrder,
    debounceDelay: 500,
  });

   const { deleteItem } = useDeleteData(
      ALLEndpoint.GRNEndpoints.deleteGRN.endpoint,
      ALLEndpoint.GRNEndpoints.deleteGRN.method
    );
  
    const handleDelete = (grn_id) => {
      deleteItem({
        idField: "grn_id",
        idValue: grn_id,
        setState: setGrns,
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
            <option value="grn_number">GRN Number</option>
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
                <th className="border px-4 py-2">GRN Number</th>
                <th className="border px-4 py-2">Order ID</th>
                <th className="border px-4 py-2">Received Date</th>
                <th className="border px-4 py-2">Total Amount</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Action</th>
                <th className="border px-4 py-2">Create Invoice</th>
              </tr>
            </thead>
            <tbody>
              {grns.length > 0 ? (
                grns.map((grn, idx) => (
                  <tr key={grn.id} className="text-center">
                    <td className="border px-4 py-2">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="border px-4 py-2">{grn.grn_number}</td>
                    <td className="border px-4 py-2">{grn.order_id}</td>
                    <td className="border px-4 py-2">
                      {new Date(grn.received_date).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">₹{grn.total_amount}</td>
                    <td className="border px-4 py-2">{grn.status}</td>
                    <td className="border px-4 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/grn/edit/${grn.id}`)}
                        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <FiEdit className="text-green-600" size={18} />
                      </button>
                      <button
                        onClick={()=>handleDelete(grn.id)}
                        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <FiTrash2 className="text-red-500" size={18} />
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
                    <td className="border px-4 py-2">
                      <button
                        onClick={() =>
                          navigate(`/purchase-invoice/add/${grn.id}`)
                        }
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Create Invoice
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No GRNs found
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

export default GRNList;
