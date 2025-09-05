import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiFilePlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";

function PurchaseOrder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("order_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");
  const [page, setPage] = useState(1);

  const limit = 10;
  const navigate = useNavigate();


  const {
    data: orders,
    metadata,
    loading,
    setData: setOrders,
  } = useFetchData({
    endpoint: ALLEndpoint.PurchaseOrderEndpoints.getPurchaseOrder.endpoint,
    name: "order",
    page,
    limit,
    searchTerm,
    searchField,
    statusFilter,
    sortField,
    sortOrder,
    debounceDelay: 500,
  });

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const { deleteItem } = useDeleteData(
    ALLEndpoint.PurchaseOrderEndpoints.deletePurchaseOrder.endpoint,
    ALLEndpoint.PurchaseOrderEndpoints.deletePurchaseOrder.method
  );

  const handleDelete = (order_id) => {
    deleteItem({
      idField: "order_id",
      idValue: order_id,
      setState: setOrders,
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
            <option value="order_number">Order Number</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial received">Partial received</option>
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

        <button
          onClick={() => navigate("/purchase-order/add")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Add Purchase Order +
        </button>
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
                <th className="border px-4 py-2">Order Number</th>
                <th className="border px-4 py-2">Vendor ID</th>
                <th className="border px-4 py-2">Order Date</th>
                <th className="border px-4 py-2">Total Amount</th>
                <th className="border px-4 py-2">Expected Delivery</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Action</th>
                <th className="border px-4 py-2">Create GRN</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((o, idx) => {
                  const isDisabled = ["completed", "cancelled"].includes(o.status);

                  return (
                    <tr
                      key={o.order_number}
                      className={`text-center ${
                        isDisabled ? "bg-gray-100 opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      <td className="border px-4 py-2">{(page - 1) * limit + idx + 1}</td>
                      <td className="border px-4 py-2">{o.order_number}</td>
                      <td className="border px-4 py-2">{o.vendor_id}</td>
                      <td className="border px-4 py-2">{formatDate(o.order_date)}</td>
                      <td className="border px-4 py-2">₹{o.total_amount}</td>
                      <td className="border px-4 py-2">
                        {formatDate(o.expected_delivery_date)}
                      </td>
                      <td className="border px-4 py-2">{o.status}</td>
                      <td className="border px-4 py-2">
                        <button
                          disabled={isDisabled}
                          onClick={() =>
                            navigate(`/purchase-order/edit/${o.id}`, {
                              state: { order: o },
                            })
                          }
                          className="p-2 rounded-md hover:bg-gray-200 transition-colors mr-2"
                        >
                          <FiEdit className="text-green-600" size={18} />
                        </button>
                        <button
                          disabled={isDisabled}
                          onClick={() => handleDelete(o.id)}
                          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <FiTrash2 className="text-red-700" size={18} />
                        </button>
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          disabled={isDisabled}
                          onClick={() => navigate(`/grn/add/${o.id}`, { state: { order: o } })}
                          className="relative group p-2 rounded-md hover:bg-gray-200 transition-colors mr-2"
                        >
                          <FiFilePlus className="text-orange-500" size={18} />
                          {!isDisabled && (
                            <span className="absolute left-1/2 -translate-x-1/2 mt-1 
                              text-xs bg-gray-800 text-white px-2 py-1 rounded 
                              opacity-0 group-hover:opacity-100 transition-opacity 
                              whitespace-nowrap">
                              Create GRN
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No purchase orders found
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

export default PurchaseOrder;
