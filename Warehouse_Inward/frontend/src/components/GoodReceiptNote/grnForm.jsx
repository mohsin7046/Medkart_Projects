import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";

function GrnForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("");
  const [formData, setFormData] = useState({
    grn_id: "",
    order_id: "",
    received_date: new Date().toISOString().split("T")[0],
    status: "pending",
    items: [],
  });

  useEffect(() => {
    if (location.pathname.includes("/grn/edit")) {
      setMode("edit");
    } else if (location.pathname.includes("/grn/add")) {
      setMode("create");
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = null;

        if (mode === "edit") {
          url = `${ALLEndpoint.GRNEndpoints.getGRNById.endpoint}/${id}`;
        } else if (mode === "create") {
          url = `${ALLEndpoint.PurchaseOrderEndpoints.getPurchaseOrderById.endpoint}/${id}`;
        }

        const res = await fetch(url);
        const response = await res.json();
        const data = response.data || response;

        if (mode === "edit") {
          setFormData({
            grn_id: data.id,
            order_id: data.order_id,
            received_date: data.received_date.split("T")[0],
            status: data.status || "pending",
            items: data.goodReceiptNoteItems.map((i) => ({
              product_id: i.product_id,
              batch_number: String(i.batch_number),
              ordered_qty: i.ordered_qty,
              recevied_qty: i.recevied_qty || 0,
              expiry_date: i.expiry_date.split("T")[0],
              damaged_qty: i.damaged_qty || 0,
              shortage_qty: i.shortage_qty || 0,
              item_price: i.item_price,
              item_mrp: i.item_mrp,
              totalAmount: i.totalAmount,
            })),
          });
        } else if (mode === "create") {
          setFormData({
            grn_number: "",
            order_id: id,
            received_date: new Date().toISOString().split("T")[0],
            status: "pending",
            items: data.purchaseOrderItems.map((i) => ({
              product_id: i.product_id,
              batch_number: "",
              ordered_qty: i.quantity,
              recevied_qty: 0,
              expiry_date: "",
              damaged_qty: 0,
              shortage_qty: 0,
              item_price: i.item_price,
              item_mrp: i.item_mrp,
              totalAmount: 0,
            })),
          });
        }
      } catch (err) {
        toast.error("❌ Failed to fetch data");
        console.error("Error fetching GRN/PO:", err);
      }
    };

    if (id && mode) {
      fetchData();
    }
  }, [id, mode]);

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

    let payload;

    if (mode === "create") {
      payload = {
        order_id: Number(id),
        received_date: formData.received_date,
        items: formData.items.map((i) => ({
          product_id: Number(i.product_id),
          batch_number: String(i.batch_number),
          expiry_date: i.expiry_date || new Date().toISOString().split("T")[0],
          recevied_qty: Number(i.recevied_qty),
          ordered_qty: Number(i.ordered_qty),
          damaged_qty: Number(i.damaged_qty),
          shortage_qty: Number(i.shortage_qty),
          item_price: Number(i.item_price),
          item_mrp: Number(i.item_mrp),
        })),
      };
    } else {
      payload = {
        grn_id: Number(id),
        order_id: Number(formData.order_id),
        received_date: formData.received_date,
        status: formData.status,
        items: formData.items.map((i) => ({
          id: i.id,
          product_id: Number(i.product_id),
          batch_number: String(i.batch_number),
          expiry_date: i.expiry_date || new Date().toISOString().split("T")[0],
          recevied_qty: Number(i.recevied_qty),
          ordered_qty: Number(i.ordered_qty),
          damaged_qty: Number(i.damaged_qty),
          shortage_qty: Number(i.shortage_qty),
          item_price: Number(i.item_price),
          item_mrp: Number(i.item_mrp),
        })),
      };
    }

    try {
      let url = `${ALLEndpoint.GRNEndpoints.addGRN.endpoint}`;
      let method = `${ALLEndpoint.GRNEndpoints.addGRN.method}`;

      if (mode === "edit") {
        url = `${ALLEndpoint.GRNEndpoints.updateGRN.endpoint}`;
        method = `${ALLEndpoint.GRNEndpoints.updateGRN.method}`;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const resData = await response.json();
        if (Array.isArray(resData.message)) {
          resData.message.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(resData.error || resData.message || "Something went wrong");
        }
        return;
      }

      toast.success(
        mode === "edit"
          ? "✅ GRN updated successfully!"
          : "✅ GRN created successfully!"
      );

      navigate(mode === "edit" ? ROUTES.GRN.LIST : ROUTES.PURCHASE_ORDER.LIST);
    } catch (error) {
      console.error("Error saving GRN:", error);
      toast.error(error.message || "Error saving GRN");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-lg p-6 sm:p-8 rounded-xl w-full max-w-6xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center">
          {mode === "edit"
            ? "✏️ Edit Good Receipt Note"
            : "📦 Create Good Receipt Note"}
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
                Purchase Order ID
              </label>
              <input
                type="text"
                value={formData.order_id}
                readOnly
                className="border border-gray-300 px-3 py-2 rounded-lg w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="PO Number"
              />
            </div>
          </div>


          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-xs sm:text-sm">
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
                    <td className="border px-2 py-1">{item.product_id}</td>
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
                        min="0"
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
                        min="0"
                        step="any"
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
                        min="0"
                        step="any"
                        value={item.item_mrp}
                        onChange={(e) =>
                          handleItemChange(idx, "item_mrp", e.target.value)
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="border px-2 py-1 font-medium text-gray-700">
                      ₹{item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

         
          <div className="flex justify-center sm:justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-transform transform hover:scale-105 disabled:opacity-50"
            >
              {mode === "edit" ? "Update GRN" : "Save GRN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GrnForm;
