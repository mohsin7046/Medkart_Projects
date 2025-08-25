import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PurchaseInvoiceForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { grn } = location.state || {};
  console.log("GRN:", grn);

  const [formData, setFormData] = useState({
    grn_number: grn?.grn_number || "",
    invoice_date: new Date().toISOString().slice(0, 10),
    order_number: grn?.order_number,
    total_amount: grn?.total_amount || "",
    items:
      grn?.goodReceiptNoteItems?.map((item) => ({
        product_code: item.product_code,
        quantity: item.recevied_qty,
        item_price: item.item_price,
        item_mrp: item.item_mrp,
        totalAmount: item.totalAmount,
        gst_percentage: item.gst_percentage || 0,
      })) || [],
  });

  console.log("FormData", formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemsWithGST = formData.items.map((item) => {
    const baseTotal = item.quantity * item.item_price;
    const gstAmount = (baseTotal * (item.gst_percentage || 0)) / 100;
    return {
      ...item,
      totalAmount: baseTotal + gstAmount,
    };
  });


  const totalAmount = itemsWithGST.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  const finalData = {
    ...formData,
    items: itemsWithGST,
    total_amount: totalAmount,
  };
    
    try {
      const url = "http://localhost:3000/purchase-invoice/createPI";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error("Failed to save invoice");

      navigate("/purchase-invoice");
    } catch (err) {
      console.error("Error saving invoice:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Invoice</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Grn Number</label>
          <input
            type="text"
            name="grn_number"
            value={formData.grn_number}
            className="w-full border rounded px-3 py-2 bg-gray-300"
            disabled
          />
        </div>

        <div>
          <label className="block font-medium">Order Number</label>
          <input
            type="text"
            name="order_number"
            value={formData.order_number}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-300"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Invoice Date</label>
          <input
            type="date"
            name="invoice_date"
            value={formData.invoice_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        

        <div>
          <h3 className="font-semibold mb-2">Items</h3>
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-2 mb-3 border p-2 rounded"
            >
              <input
                type="text"
                value={item.product_code}
                onChange={(e) =>
                  handleItemChange(index, "product_code", e.target.value)
                }
                className="border rounded px-2 py-1"
                placeholder="Product Code"
                readOnly
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                className="border rounded px-2 py-1"
                placeholder="Qty"
              />
              <input
                type="number"
                value={item.item_price}
                onChange={(e) =>
                  handleItemChange(index, "item_price", e.target.value)
                }
                className="border rounded px-2 py-1"
                placeholder="Price"
              />
              <input
                type="number"
                value={item.item_mrp}
                onChange={(e) =>
                  handleItemChange(index, "item_mrp", e.target.value)
                }
                className="border rounded px-2 py-1"
                placeholder="MRP"
              />
              <input
                type="number"
                value={item.totalAmount}
                onChange={(e) =>
                  handleItemChange(index, "totalAmount", e.target.value)
                }
                className="border rounded px-2 py-1"
                placeholder="Total"
              />
              <input
                type="number"
                value={item.gst_percentage}
                onChange={(e) =>
                  handleItemChange(index, "gst_percentage", e.target.value)
                }
                className="border rounded px-2 py-1"
                placeholder="GST %"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block font-medium">Total Amount</label>
          <input
            type="number"
            name="total_amount"
            value={formData.total_amount}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-gray-300"
            disabled
            required
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
