import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function GRNView() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const grn = state?.grn;

  if (!grn) {
    return <p className="text-red-500">No GRN data found.</p>;
  }

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 bg-gray-500 text-white rounded-md"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">GRN Details</h2>

      <div className="bg-white shadow-md p-4 rounded-md mb-6">
        <p><strong>GRN Number:</strong> {grn.grn_number}</p>
        <p><strong>Order Number:</strong> {grn.order_number}</p>
        <p><strong>Received Date:</strong> {new Date(grn.received_date).toLocaleDateString()}</p>
        <p><strong>Damaged Qty:</strong> {grn.damaged_qty}</p>
        <p><strong>Shortage Qty:</strong> {grn.shortage_qty}</p>
        <p><strong>Total Amount:</strong> ₹{grn.total_amount}</p>
        <p><strong>Status:</strong> {grn.status}</p>
      </div>

      <h3 className="text-xl font-semibold mb-2">Items</h3>
      <div className="bg-white shadow-md p-4 rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border px-4 py-2">Product Code</th>
              <th className="border px-4 py-2">Batch</th>
              <th className="border px-4 py-2">Expiry</th>
              <th className="border px-4 py-2">Qty</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">MRP</th>
              <th className="border px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {grn.goodReceiptNoteItems?.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="border px-4 py-2">{item.product_code}</td>
                <td className="border px-4 py-2">{item.batch_number}</td>
                <td className="border px-4 py-2">
                  {new Date(item.expiry_date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">{item.recevied_qty}</td>
                <td className="border px-4 py-2">₹{item.item_price}</td>
                <td className="border px-4 py-2">₹{item.item_mrp}</td>
                <td className="border px-4 py-2">₹{item.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GRNView;
