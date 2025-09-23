import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ALLEndpoint } from "../../constant/endPoints";

function PurchaseInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${ALLEndpoint.PurchaseInvoiceEndpoints.getPurchaseInvoiceById.endpoint}/${id}`);
        const response = await res.json();
        const data = response.data
        console.log(data);
        
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return <div className="p-4 text-gray-600">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-4 text-red-600">No invoice data available</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
      <div className="space-y-2">
        <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
        <p><strong>GRN Number:</strong> {invoice.goodReceiptNote.grn_number}</p>
        <p><strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹{invoice.total_amount}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
      </div>

      <h3 className="text-lg font-bold mt-6 mb-2">Items</h3>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Product ID</th>
            <th className="border px-4 py-2">Product Name</th>
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
              <td className="border px-4 py-2">{item.product_id}</td>
              <td className="border px-4 py-2">{item.product.name}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">₹{item.item_price}</td>
              <td className="border px-4 py-2">₹{item.item_mrp}</td>
              <td className="border px-4 py-2">₹{item.totalAmount}</td>
              <td className="border px-4 py-2">{item.product.gst_percentage}%</td>
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
