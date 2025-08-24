import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiFilePlus } from "react-icons/fi";

function PurchaseOrder() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/purchase-orders/getAllPurchaseOrders"
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setOrders(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vendor_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : o.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this purchase order?")
    ) {
      try {
        const response = await fetch(
          `http://localhost:3000/purchase-orders/deletePurchaseOrder`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purchase_order_number: id }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error || "Failed to delete purchase order");
          return;
        }
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } catch (error) {
        console.error("Error deleting purchase order:", error);
      }
    }
  };

  return (
    <div>
      <div className="bg-white shadow-md p-4 rounded-md mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by Order No. or Vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1 rounded-md w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => navigate("/purchase-order/add")}
        >
          Add Purchase Order +
        </button>
      </div>

      <div className="bg-white shadow-md p-4 rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Order Number</th>
              <th className="border px-4 py-2">Vendor Code</th>
              <th className="border px-4 py-2">Order Date</th>
              <th className="border px-4 py-2">Total Amount</th>
              <th className="border px-4 py-2">Expected Delivery</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
              <th className="border px-4 py-2">Create GRN</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o, idx) => {
                const isDisabled = ["completed", "cancelled"].includes(
                  o.status
                );

                return (
                  <tr
                    key={o.id}
                    className={`text-center ${
                      isDisabled
                        ? "bg-gray-100 opacity-60 pointer-events-none"
                        : ""
                    }`}
                  >
                    <td className="border px-4 py-2">{idx + 1}</td>
                    <td className="border px-4 py-2">{o.order_number}</td>
                    <td className="border px-4 py-2">{o.vendor_code}</td>
                    <td className="border px-4 py-2">
                      {formatDate(o.order_date)}
                    </td>
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
                        className={`p-2 rounded-md hover:bg-gray-200 transition-colors mr-2 ${
                          isDisabled ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      >
                        <FiEdit className="text-green-600" size={18} />
                      </button>

                      <button
                        disabled={isDisabled}
                        onClick={() => handleDelete(o.order_number)}
                        className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
                          isDisabled ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      >
                        <FiTrash2 className="text-red-700" size={18} />
                      </button>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        disabled={isDisabled}
                        onClick={() =>
                          navigate(`/grn/add`, { state: { order: o } })
                        }
                        className={`relative group p-2 rounded-md hover:bg-gray-200 transition-colors mr-2 ${
                          isDisabled ? "cursor-not-allowed opacity-50" : ""
                        }`}
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
    </div>
  );
}

export default PurchaseOrder;
