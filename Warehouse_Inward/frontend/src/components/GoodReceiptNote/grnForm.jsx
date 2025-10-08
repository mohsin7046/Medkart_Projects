import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";
import { SearchSelect } from "../utility/SearchSelect.jsx";

function FieldErrorIcon({ message }) {
  if (!message) return null;

  return (
    <span className="relative inline-block ml-1 min-w-6 min-h-6 rounded-full bg-red-500 group">
      !
      <div className="absolute hidden group-hover:block bg-white text-red-700 text-xs border border-red-300 rounded-md p-2 shadow-lg w-56 left-full top-1/2 -translate-y-1/2 ml-2 whitespace-normal z-10">
        {message}
      </div>
    </span>
  );
}

function GrnForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const [errors, setErrors] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    grn_id: "",
    vendor_id: "",
    vendor_name: "",
    gate_pass_id: "",
    gate_pass_number:"",
    total_amount: 0,
    total_qty: 0,
    total_products: 0,
    items: [
      {
        product_id: "",
        product_name: "",
        batch_number: "",
        expiry_date: "",
        billed_qty: 0,
        item_ptr: 0,
        item_mrp: 0,
        total_amount: 0,
      },
    ],
  });


  useEffect(() => {
    if (location.pathname.includes("/grn/edit")) setMode("edit");
    else if (location.pathname.includes("/grn/add")) setMode("create");
  }, [location]);


  useEffect(() => {
    if (!mode || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        if (mode === "edit") {
          const res = await fetch(`${ALLEndpoint.GRNEndpoints.getGRNById.endpoint}/${id}`);
          const response = await res.json();
          const data = response.data || response;

          setFormData({
            grn_id: data.id,
            vendor_id: data.vendor.id,
            vendor_name: data.vendor.name,
            gate_pass_id: data.gate_pass_id,
            total_amount: data.total_amount,
            total_qty: data.total_qty,
            total_products: data.total_products,
            items: data.goodReceiptNoteItems.map((i) => ({
              product_id: i.product.id,
              product_name: i.product?.name,
              batch_number: i.batch_number,
              expiry_date: i.expiry_date.split("T")[0],
              billed_qty: i.billed_qty,
              item_ptr: i.item_ptr,
              item_mrp: i.item_mrp,
              total_amount: i.total_amount,
            })),
          });
        } else if (mode === "create") {
          const res = await fetch(`${ALLEndpoint.GatePassEndpoints.getGatePassById.endpoint}/${id}`);
          const response = await res.json();
          const data = response.data || response;
          console.log(data);
          
          if (!data) return;
          console.log(data);
          
        setFormData({
          grn_id: "", 
          vendor_id: data.vendor?.id || "",
          vendor_name: data.vendor?.name || "",
          gate_pass_number: data?.gate_pass_number,
          gate_pass_id:id,
          total_amount: data.invoice_amount || 0,
          total_qty: 0, 
          total_products: 0,
          items: [
            {
              product_id: "",
              product_name: "",
              batch_number: "",
              expiry_date: "",
              billed_qty: 0,
              item_ptr: 0,
              item_mrp: 0,
              total_amount: 0,
            },
          ],
        });
      
        }
      } catch (err) {
        toast.error("❌ Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, mode]);

  const handleVendorSelect = (vendor) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
    }));
  };

  const handleProductSelect = (index, product) => {
    setIsDirty(true);
    const updatedItems = [...formData.items];
    updatedItems[index].product_id = product.id;
    updatedItems[index].product_name = product.name;

    setSelectedProductIds((prev) => [...prev, product.id]);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleItemChange = (index, field, value) => {
    setIsDirty(true);
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    if (["billed_qty", "item_ptr"].includes(field)) {
      updatedItems[index].total_amount =
        (parseFloat(updatedItems[index].billed_qty) || 0) *
        (parseFloat(updatedItems[index].item_ptr) || 0);
    }

    const total_amount = updatedItems.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const total_qty = updatedItems.reduce((sum, i) => sum + (i.billed_qty || 0), 0);

    setFormData({
      ...formData,
      items: updatedItems,
      total_amount,
      total_qty,
      total_products: updatedItems.length,
    });
  };

  const handleAddItem = () => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: "",
          product_name: "",
          batch_number: "",
          expiry_date: "",
          billed_qty: 0,
          item_ptr: 0,
          item_mrp: 0,
          total_amount: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setIsDirty(true);
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const total_amount = updatedItems.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const total_qty = updatedItems.reduce((sum, i) => sum + (i.billed_qty || 0), 0);

    setFormData({
      ...formData,
      items: updatedItems,
      total_amount,
      total_qty,
      total_products: updatedItems.length,
    });
  };

  const getFieldError = (productId, fieldType) => {
    const error = errors.find(
      (err) =>
        err.product_id === productId &&
        (err.type.includes(fieldType.toUpperCase()) || err.type.includes(fieldType))
    );
    return error ? error.message : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const payload = {
      ...(mode === "edit" && { grn_id: formData.grn_id }),
      vendor_id: Number(formData.vendor_id),
      gate_pass_id: Number(formData.gate_pass_id),
      total_amount: Number(formData.total_amount),
      total_qty: Number(formData.total_qty),
      total_products: Number(formData.total_products),
      items: formData.items.map((i) => ({
        product_id: Number(i.product_id),
        batch_number: String(i.batch_number),
        expiry_date: new Date(i.expiry_date) || new Date().toISOString(),
        billed_qty: Number(i.billed_qty),
        item_ptr: Number(i.item_ptr),
        item_mrp: Number(i.item_mrp),
        total_amount: Number(i.total_amount),
      })),
    };

    try {
      let url =
        mode === "edit"
          ? ALLEndpoint.GRNEndpoints.updateGRN
          : ALLEndpoint.GRNEndpoints.addGRN;

      const res = await fetch(url.endpoint, {
        method: url.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message.validation_result && !data.message.validation_result.isValid) {
          setErrors(data.message.validation_result.errors);
          toast.error("Validation errors found. Please check highlighted fields.");
          return;
        }
        toast.error(data.message || "Failed to save GRN");
        return;
      }

      toast.success(mode === "edit" ? "✅ GRN updated!" : "✅ GRN created!");
      setIsDirty(false);
      navigate(ROUTES.GRN.LIST);
    } catch (err) {
      toast.error("Error saving GRN");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const globalErrors = errors.filter((e) => !e.product_id);
    if (globalErrors.length) {
      globalErrors.forEach((err) => toast.error(err.message));
    }
  }, [errors]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-6">
      <div className="bg-white shadow-xl p-4 sm:p-6 md:p-8 rounded-2xl w-full max-w-6xl overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          📦 {mode === "edit" ? "Edit GRN" : "Create GRN"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
         
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              type="vendor"
              value={formData.vendor_name}
              onSelect={handleVendorSelect}
              selectedIds={[]}
              readOnly={mode === "edit"}
            />
          </div>

         
          <InputField
            label="Gate Pass Number"
           type="text"
            readOnly
            value={formData.gate_pass_number}
          />

          <div className="overflow-x-auto border rounded-lg mt-4">
            <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
              <thead>
                <tr className="bg-gray-100 text-center">
                  {["Product", "Batch No", "Expiry", "Qty", "PTR", "MRP", "Total", "Action"].map(
                    (h) => (
                      <th key={h} className="border px-2 py-2 whitespace-nowrap">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx} className="text-center hover:bg-gray-50">
                    <td className="border px-2 py-1 relative min-w-[120px]">
                      <div className="flex items-center justify-center gap-1">
                      <SearchSelect
                        type="product"
                        value={item.product_name}
                        onSelect={(p) => handleProductSelect(idx, p)}
                        selectedIds={selectedProductIds.filter((id) => id !== item.product_id)}
                      />
                      <FieldErrorIcon
                          message={getFieldError(item.product_id, "UNORDERED_PRODUCT")}
                        />
                        </div>
                    </td>
                    <td className="border px-2 py-1 min-w-[100px]">
                      <InputField
                        value={item.batch_number}
                        onChange={(e) => handleItemChange(idx, "batch_number", e.target.value)}
                      />
                    </td>
                    <td className="border px-2 py-1 relative min-w-[120px]">
                      <div className="flex items-center justify-center gap-1">
                        <InputField
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) => handleItemChange(idx, "expiry_date", e.target.value)}
                        />
                        <FieldErrorIcon
                          message={getFieldError(item.product_id, "EXPIRY_VALIDATION")}
                        />
                      </div>
                    </td>
                    <td className="border px-2 py-1 relative min-w-[80px]">
                      <div className="flex items-center justify-center gap-1">
                        <InputField
                          type="number"
                          min="0"
                          value={item.billed_qty}
                          onChange={(e) => handleItemChange(idx, "billed_qty", e.target.value)}
                        />
                        <FieldErrorIcon message={getFieldError(item.product_id, "QUANTITY")} />
                      </div>
                    </td>
                    <td className="border px-2 py-1 min-w-[80px]">
                      <div className="flex items-center justify-center gap-1">
                      <InputField
                        type="number"
                        min="0"
                        value={item.item_ptr}
                        onChange={(e) => handleItemChange(idx, "item_ptr", e.target.value)}
                      />
                       <FieldErrorIcon message={getFieldError(item.product_id, "PTR_MRP_RATIO_VALIDATION")} />
                       </div>
                    </td>
                    <td className="border px-2 py-1 min-w-[80px]">
                       <div className="flex items-center justify-center gap-1">
                      <InputField
                        type="number"
                        min="0"
                        value={item.item_mrp}
                        onChange={(e) => handleItemChange(idx, "item_mrp", e.target.value)}
                      />
                       <FieldErrorIcon message={getFieldError(item.product_id, "MRP_DEVIATION")} />
                       </div>
                    </td>
                    <td className="border px-2 py-1 font-medium text-gray-700 min-w-[80px]">
                      ₹{item.total_amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="border px-2 py-1 min-w-[60px]">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:bg-gray-200 rounded px-2 py-1 text-sm"
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

    
          <div className="flex justify-start mt-4">
            <Button type="button" variant="secondary" onClick={handleAddItem}>
              + Add Item
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
            <Button
              variant="secondary"
              onClick={() =>
                (isDirty && !window.confirm("Unsaved changes. Continue?")) ||
                navigate(ROUTES.GRN.LIST)
              }
            >
              Back
            </Button>

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
