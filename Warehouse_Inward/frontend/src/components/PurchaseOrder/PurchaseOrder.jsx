import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiFilePlus } from "react-icons/fi";

function PurchaseOrder() {
  const [orders, setOrders] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("order_number");
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
          name: "order",
        });

        if (searchTerm) params.append("search", searchTerm);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (searchField) params.append("field", searchField);

        console.log(params.toString());
        
        const response = await fetch(
          `http://localhost:3000/api/v1/purchase-order?${params.toString()}`
        );

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        console.log(data);
        

        setOrders(data.data.data || []);
        setMetadata(data.data.metadata || {});
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };
    fetchData();
  }, [page, searchTerm, searchField, statusFilter, sortField, sortOrder]);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const handleDelete = (order_id) => async () => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/purchase-order`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({order_id }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete purchase order");
          return;
        }
        setOrders((prev) => prev.filter((o) => o.order_id !== order_id));
        alert("Purchase order deleted successfully");
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        alert("Failed to delete purchase order");
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
                      isDisabled
                        ? "bg-gray-100 opacity-60 pointer-events-none"
                        : ""
                    }`}
                  >
                    <td className="border px-4 py-2">
                      {(page - 1) * limit + idx + 1}
                    </td>
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
                        onClick={handleDelete(o.id)}
                        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <FiTrash2 className="text-red-700" size={18} />
                      </button>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        disabled={isDisabled}
                        onClick={() => navigate(`/grn/add`, { state: { order: o } })}
                        className="relative group p-2 rounded-md hover:bg-gray-200 transition-colors mr-2"
                      >
                        <FiFilePlus className="text-orange-500" size={18} />
                        {!isDisabled && (
                          <span
                            className="absolute left-1/2 -translate-x-1/2 mt-1 
                              text-xs bg-gray-800 text-white px-2 py-1 rounded 
                              opacity-0 group-hover:opacity-100 transition-opacity 
                              whitespace-nowrap"
                          >
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
