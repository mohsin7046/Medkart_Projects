import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";

function GrnForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

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
        setLoading(true);
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
      }finally {
        setLoading(false);
      }
    };

    if (id && mode) {
      fetchData();
    };

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
     setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-lg p-6 sm:p-8 rounded-xl w-full max-w-6xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center">
          {mode === "edit" ? "✏️ Edit GRN" : "📦 Create GRN"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <InputField
              label="Received Date"
              type="date"
              value={formData.received_date}
              onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
            />
            <InputField
              label="Purchase Order ID"
              type="text"
              value={formData.order_id}
              readOnly
            />
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100 text-center">
                  {["Product", "Batch No", "Expiry", "Ordered", "Received", "Damaged", "Shortage", "Price", "MRP", "Total"].map((h) => (
                    <th key={h} className="border px-2 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx} className="text-center hover:bg-gray-50">
                    <td className="border px-2 py-1">{item.product_id}</td>
                    <td className="border px-2 py-1">
                      <InputField value={item.batch_number} onChange={(e) => handleItemChange(idx, "batch_number", e.target.value)} />
                    </td>
                    <td className="border px-2 py-1">
                      <InputField type="date" value={item.expiry_date} onChange={(e) => handleItemChange(idx, "expiry_date", e.target.value)} />
                    </td>
                    <td className="border px-2 py-1">{item.ordered_qty}</td>
                    <td className="border px-2 py-1">
                      <InputField type="number" min="0" value={item.recevied_qty} onChange={(e) => handleItemChange(idx, "recevied_qty", e.target.value)} />
                    </td>
                    <td className="border px-2 py-1">
                      <InputField type="number" min="0" value={item.damaged_qty} onChange={(e) => handleItemChange(idx, "damaged_qty", e.target.value)} />
                    </td>
                    <td className="border px-2 py-1">
                      <InputField type="number" value={item.shortage_qty} readOnly />
                    </td>
                    <td className="border px-2 py-1">
                      <InputField type="number" min="0" step="any" value={item.item_price} onChange={(e) => handleItemChange(idx, "item_price", e.target.value)} />
                    </td>
                    <td className="border px-2 py-1">
                      <InputField type="number" min="0" step="any" value={item.item_mrp} onChange={(e) => handleItemChange(idx, "item_mrp", e.target.value)} />
                    </td>
                    <td className="border px-2 py-1 font-medium text-gray-700">₹{item.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Button type="submit" variant="primary" loading={loading}>
              {mode === "edit" ? "Update GRN" : "Save GRN"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GrnForm;
