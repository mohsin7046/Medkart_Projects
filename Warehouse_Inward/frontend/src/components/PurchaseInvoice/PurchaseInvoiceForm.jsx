import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { toast } from 'react-toastify'

function PurchaseInvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchGRN = async () => {
      try {
        const response = await fetch(`${ALLEndpoint.GRNEndpoints.getGRNById.endpoint}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch GRN");
        const data = await response.json();
        console.log("Fetched GRN:", data);

        const grn = data.data;

        setFormData({
          grn_number: grn.grn_number,
          order_id: grn.order_id,
          invoice_date: new Date().toISOString().slice(0, 10),
          total_amount: grn.total_amount,

          status: grn.status,
          items:
            grn.goodReceiptNoteItems?.map((item) => ({
              product_id: item.product_id,
              batch_number: item.batch_number,
              expiry_date: item.expiry_date?.slice(0, 10),
              ordered_qty: item.ordered_qty,
              recevied_qty: item.recevied_qty,
              damaged_qty: item.damaged_qty,
              shortage_qty: item.shortage_qty,
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
    setLoading(true)
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
      const url =  `${ALLEndpoint.PurchaseInvoiceEndpoints.addPurchaseInvoice.endpoint}`;
      const response = await fetch(url, {
        method:  `${ALLEndpoint.PurchaseInvoiceEndpoints.addPurchaseInvoice.method}`,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const resData = await response.json();

        if (Array.isArray(resData.message)) {
          resData.message.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          })
        } else {
          toast.error(resData.error || resData.message || "Something went wrong");
        }
        setLoading(false);
        return;
      }

      alert("Invoice created successfully!");
      navigate(ROUTES.PURCHASE_INVOICE.LIST);
    } catch (err) {
      console.error("Error saving invoice:", err);
    }finally{
      setLoading(false)
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

        <div>
          <h3 className="font-semibold mb-2">Items</h3>
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-9 gap-1 mb-3 border p-2 rounded"
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
                  value={item.recevied_qty}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Shortage Qty</label>
                <input
                  type="number"
                  value={item.shortage_qty}
                  className="border rounded px-2 py-1 bg-gray-200 w-full"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm">Damaged Qty</label>
                <input
                  type="number"
                  value={item.damaged_qty}
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
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {length ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            "Save Invoice"
          )}
        </button>
      </form>
    </div>
  );
}

export default PurchaseInvoiceForm;
