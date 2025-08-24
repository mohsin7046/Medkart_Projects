import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function GrnForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  const [formData, setFormData] = useState({
    purchase_order_number: order?.order_number || "",
    received_date: new Date().toISOString().split("T")[0],
    damaged_qty: 0,
    shortage_qty: 0,
    status: "pending",
    items:
      order?.purchaseOrderItems?.map((item) => ({
        product_code: item.product_code,
        batch_number: "",
        expiry_date: item.expiry_date
          ? new Date(item.expiry_date).toISOString().split("T")[0]
          : "",
        ordered_qty: item.quantity,
        received_qty: item.quantity,
        damaged_qty: 0,
        shortage_qty: 0,
        item_price: item.item_price,
        item_mrp: item.item_mrp,
        totalAmount: item.quantity * item.item_price,
      })) || [],
  });

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === "received_qty" || field === "item_price") {
      updatedItems[index].totalAmount =
        (parseInt(updatedItems[index].received_qty) || 0) *
        (parseFloat(updatedItems[index].item_price) || 0);
    }

    if (field === "received_qty") {
      updatedItems[index].shortage_qty =
        (parseInt(updatedItems[index].ordered_qty) || 0) -
        (parseInt(updatedItems[index].received_qty) || 0);
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalAmount = formData.items.reduce(
      (sum, i) => sum + (i.totalAmount || 0),
      0
    );
    const totalDamaged = formData.items.reduce(
      (sum, i) => sum + (parseInt(i.damaged_qty) || 0),
      0
    );
    const totalShortage = formData.items.reduce(
      (sum, i) => sum + (parseInt(i.shortage_qty) || 0),
      0
    );

    const payload = {
      ...formData,
      total_amount: totalAmount,
      damaged_qty: totalDamaged,
      shortage_qty: totalShortage,
      items: formData.items.map((i) => ({
        product_code: i.product_code,
        batch_number: i.batch_number,
        expiry_date: i.expiry_date
          ? new Date(i.expiry_date).toISOString()
          : null,
        recevied_qty: i.received_qty,
        item_price: i.item_price,
        item_mrp: i.item_mrp,
        totalAmount: i.totalAmount,
      })),
    };

    console.log("Submitting GRN:", payload);

    if (!payload.items[0].batch_number || !payload.items[0].expiry_date) {
      alert("Please fill all batch numbers and expiry dates.");
    }

    try {
      const response = await fetch("http://localhost:3000/grn/create-grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to create GRN");
        return;
      }

      alert("GRN created successfully!");
      navigate("/purchase-order");
    } catch (error) {
      console.error("Error creating GRN:", error);
    }
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-xl max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create Good Receipt Note
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Received Date
            </label>
            <input
              type="date"
              value={formData.received_date}
              onChange={(e) =>
                setFormData({ ...formData, received_date: e.target.value })
              }
              className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Purchase Order Number
            </label>
            <input
              type="text"
              value={formData.purchase_order_number}
              readOnly
              className="border border-gray-300 px-3 py-2 rounded-lg w-full bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="PO Number"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border px-2 py-2">Product</th>
                <th className="border px-2 py-2">Batch No</th>
                <th className="border px-2 py-2">Expiry</th>
                <th className="border px-2 py-2">Ordered</th>
                <th className="border px-2 py-2">Received</th>
                <th className="border px-2 py-2">Damaged</th>
                <th className="border px-2 py-2">Shortage</th>
                <th className="border px-2 py-2">Price</th>
                <th className="border px-2 py-2">MRP</th>
                <th className="border px-2 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <tr key={idx} className="text-center hover:bg-gray-50">
                  <td className="border px-2 py-1">{item.product_code}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      placeholder="Batch No"
                      value={item.batch_number}
                      onChange={(e) =>
                        handleItemChange(idx, "batch_number", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="date"
                      value={item.expiry_date}
                      onChange={(e) =>
                        handleItemChange(idx, "expiry_date", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">{item.ordered_qty}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.received_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "received_qty", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.damaged_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "damaged_qty", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      readOnly
                      value={item.shortage_qty}
                      className="border px-2 py-1 rounded w-full bg-gray-100"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.item_price}
                      onChange={(e) =>
                        handleItemChange(idx, "item_price", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={item.item_mrp}
                      onChange={(e) =>
                        handleItemChange(idx, "item_mrp", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1 font-medium text-gray-700">
                    ₹{item.totalAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
          >
            Save GRN
          </button>
        </div>
      </form>
    </div>
  );
}

export default GrnForm;
