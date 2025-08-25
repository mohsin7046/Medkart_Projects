import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function GrnForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();


   const isEdit = id ? true : false;
  let passedGrn = {};

  if (isEdit) {
    passedGrn = location.state?.grn || {};
     console.log("Edit",passedGrn);
  } else {
    passedGrn = location.state?.order || {};
    console.log("Add",passedGrn);
  }

  const [formData, setFormData] = useState({
    grn_number: "",
    purchase_order_number: "",
    received_date: new Date().toISOString().split("T")[0],
    damaged_qty: 0,
    shortage_qty: 0,
    status: "pending",
    items: [],
  });


useEffect(() => {
    if (passedGrn) {
      setFormData({
        grn_number: passedGrn.grn_number || `GRN-${Date.now()}`,
        purchase_order_number: passedGrn.order_number || "",
        received_date: passedGrn.received_date
          ? passedGrn.received_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        damaged_qty: passedGrn.damaged_qty || 0,
        shortage_qty: passedGrn.shortage_qty || 0,
        status: passedGrn.status || "pending",
        items: isEdit
          ? 
            passedGrn.goodReceiptNoteItems?.map((i) => ({
              id: i.id,
              product_code: i.product_code,
              batch_number: i.batch_number || "",
              expiry_date: i.expiry_date
                ? i.expiry_date.split("T")[0]
                : "",
              ordered_qty: i.ordered_qty || 0,
              recevied_qty: i.recevied_qty || 0,
              damaged_qty: i.damaged_qty || 0,
              shortage_qty: i.shortage_qty || 0,
              item_price: i.item_price,
              item_mrp: i.item_mrp,
              totalAmount: i.totalAmount,
            })) || []
          : 
            passedGrn.purchaseOrderItems?.map((i) => ({
              id: i.id,
              product_code: i.product_code,
              batch_number: "",
              expiry_date: "",
              ordered_qty: i.quantity || 0,
              recevied_qty: 0,
              damaged_qty: 0,
              shortage_qty: 0,
              item_price: i.item_price,
              item_mrp: i.item_mrp,
              totalAmount: i.totalAmount,
            })) || [],
      });
    }
  }, [id, passedGrn, isEdit]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (field === "recevied_qty" || field === "item_price") {
      updatedItems[index].totalAmount =
        (parseInt(updatedItems[index].recevied_qty) || 0) *
        (parseFloat(updatedItems[index].item_price) || 0);
    }

    if (field === "recevied_qty") {
      updatedItems[index].shortage_qty =
        (parseInt(updatedItems[index].ordered_qty) || 0) -
        (parseInt(updatedItems[index].recevied_qty) || 0);
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
        id: i.id,
        product_code: i.product_code,
        batch_number: i.batch_number,
        ordered_qty:i.ordered_qty,
        expiry_date: i.expiry_date,
        recevied_qty: i.recevied_qty,
        item_price: i.item_price,
        item_mrp: i.item_mrp,
        totalAmount: i.totalAmount,
      })),
    };

    console.log("Submitting GRN:", payload);

    try {
      let url = "http://localhost:3000/grn/create-grn";
      let method = "POST";

      if (id) {
        url = `http://localhost:3000/grn/update-grn`;
        method = "PUT";
      }

      console.log(url, method, payload);
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok){
        const Error = await response.json();
        alert("Error: " + Error.error);
        return;
      }

      alert(id ? "GRN updated successfully!" : "GRN created successfully!");
      if(isEdit){
        navigate('/grn')
      }
      navigate("/purchase-order");
    } catch (error) {
      console.error("Error saving GRN:", error);
    }
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-xl max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {id ? "Edit Good Receipt Note" : "Create Good Receipt Note"}
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
                      value={item.recevied_qty}
                      onChange={(e) =>
                        handleItemChange(idx, "recevied_qty", e.target.value)
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
            {id ? "Update GRN" : "Save GRN"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GrnForm;
