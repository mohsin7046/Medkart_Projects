import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PurchaseInvoiceView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoice } = location.state || {};

  if (!invoice) {
    return <div className="p-4 text-red-600">No invoice data available</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
      <div className="space-y-2">
        <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
        <p><strong>GRN Number:</strong> {invoice.grn_number}</p>
        <p><strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹{invoice.total_amount}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
      </div>

      <h3 className="text-lg font-bold mt-6 mb-2">Items</h3>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Product Code</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">MRP</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">GST %</th>
          </tr>
        </thead>
        <tbody>
          {invoice.PurchaseInvoiceItem?.map((item) => (
            <tr key={item.id} className="text-center">
              <td className="border px-4 py-2">{item.product_code}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">₹{item.item_price}</td>
              <td className="border px-4 py-2">₹{item.item_mrp}</td>
              <td className="border px-4 py-2">₹{item.totalAmount}</td>
              <td className="border px-4 py-2">{item.gst_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => navigate(-1)}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back
      </button>
    </div>
  );
}

export default PurchaseInvoiceView;
