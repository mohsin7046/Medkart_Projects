import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PurchaseInvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchGRN = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/grn/${id}`);
        if (!response.ok) throw new Error("Failed to fetch GRN");
        const data = await response.json();
        console.log("Fetched GRN:", data);

        const grn = data.data;

        setFormData({
          grn_number: grn.grn_number,
          order_id: grn.order_id,
          invoice_date: new Date().toISOString().slice(0, 10),
          total_amount: grn.total_amount,
          damaged_qty: grn.damaged_qty,
          shortage_qty: grn.shortage_qty,
          status: grn.status,
          items:
            grn.goodReceiptNoteItems?.map((item) => ({
              product_id: item.product_id,
              batch_number: item.batch_number,
              expiry_date: item.expiry_date?.slice(0, 10),
              ordered_qty: item.ordered_qty,
              recevied_qty: item.recevied_qty,
              item_price: item.item_price,
              item_mrp: item.item_mrp,
              totalAmount: item.totalAmount,
            })) || [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching GRN:", err);
        setLoading(false);
      }
    };

    fetchGRN();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    

    const payload = {
      grn_id: Number(id),
      invoice_date: formData.invoice_date,
      items: formData.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.recevied_qty,
        item_price: item.item_price,
        item_mrp: item.item_mrp,
      })),
    };

    console.log(payload);
    
    try {
      const url = "http://localhost:3000/api/v1/purchase-invoice";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const Error = await response.json();
        alert("Error: " + Error.error);
        return;
      }

      alert("Invoice created successfully!");
      navigate("/purchase-invoice");
    } catch (err) {
      console.error("Error saving invoice:", err);
    }
  };

  if (loading || !formData) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Invoice</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">GRN Number</label>
            <input
              type="text"
              value={formData.grn_number}
              className="w-full border rounded px-3 py-2 bg-gray-200"
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium">Order ID</label>
            <input
              type="text"
              value={formData.order_id}
              className="w-full border rounded px-3 py-2 bg-gray-200"
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium">Invoice Date</label>
            <input
              type="date"
              value={formData.invoice_date}
              className="w-full border rounded px-3 py-2 bg-gray-200"
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium">Status</label>
            <input
              type="text"
              value={formData.status}
              className="w-full border rounded px-3 py-2 bg-gray-200"
              readOnly
            />
          </div>
        </div>


        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Damaged Qty</label>
            <input
              type="number"
              value={formData.damaged_qty}
              className="w-full border rounded px-3 py-2 bg-gray-200"
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium">Shortage Qty</label>
            <input
              type="number"
              value={formData.shortage_qty}
              className="w-full border rounded px-3 py-2 bg-gray-200"
              readOnly
            />
          </div>
        </div>


        <div>
          <h3 className="font-semibold mb-2">Items</h3>
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-7 gap-2 mb-3 border p-2 rounded"
            >
              <div>
                <label className="text-sm">Product ID</label>
                <input
                  type="text"
                  value={item.product_id}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Batch</label>
                <input
                  type="text"
                  value={item.batch_number}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Expiry Date</label>
                <input
                  type="text"
                  value={item.expiry_date}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Ordered Qty</label>
                <input
                  type="number"
                  value={item.ordered_qty}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Received Qty</label>
                <input
                  type="number"
                  value={item.received_qty}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Price</label>
                <input
                  type="number"
                  value={item.item_price}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">MRP</label>
                <input
                  type="number"
                  value={item.item_mrp}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block font-medium">Total Amount</label>
          <input
            type="number"
            value={formData.total_amount}
            className="w-full border rounded px-3 py-2 bg-gray-200"
            readOnly
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Invoice
        </button>
      </form>
    </div>
  );
}

export default PurchaseInvoiceForm;
