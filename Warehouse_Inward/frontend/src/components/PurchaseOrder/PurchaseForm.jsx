import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";
import { SearchSelect } from "../utility/SearchSelect.jsx";

function PurchaseOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const [formData, setFormData] = useState({
    vendor_id: "",
    vendor_name: "",
    order_date: "",
    total_amount: "",
    total_order_qty: "",
    items: [{ product_id: "", product_name: "", ordered_qty: "", net_cost_per_qty: "" }],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${ALLEndpoint.PurchaseOrderEndpoints.getPurchaseOrderById.endpoint}/${id}`);
        const { data, message } = await res.json();
        if (!res.ok) throw new Error(message || "Failed to fetch order");

        const vendorActive = data.vendor?.status === "active";
        const vendor_id = vendorActive ? data.vendor.id : "";
        const vendor_name = vendorActive ? data.vendor.name : "";
        if (!vendorActive) toast.error("Vendor may be inactive");

        const items =
          data.purchaseOrderItems?.map((item) => {
            const productActive = item.product?.status === "active";
            if (!productActive) toast.error("Product may be inactive");
            return {
              product_id: productActive ? item.product_id : "",
              product_name: productActive ? item.product.name : "",
              ordered_qty: item.quantity?.toString() || "",
              net_cost_per_qty: item.item_price?.toString() || "",
            };
          }) || [];

        setFormData({
          vendor_id,
          vendor_name,
          order_date: data.order_date?.slice(0, 10) || "",
          expected_delivery_date: data.expected_delivery_date?.slice(0, 10) || "",
          items,
        });

        toast.success("Purchase Order loaded");
      } catch (err) {
        toast.error("Error loading purchase order");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateField = (name, value) => {
    setFormDirty(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateItem = (index, field, value) => {
    setFormDirty(true);
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", product_name: "", ordered_qty: "", net_cost_per_qty: "" }],
    }));

  const removeItem = (index) =>
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const handleVendorSelect = (vendor) => {
    updateField("vendor_id", vendor.id);
    updateField("vendor_name", vendor.name);
  };

  const handleProductSelect = (index, product) => {
    updateItem(index, "product_id", product.id);
    updateItem(index, "product_name", product.name);
  };

  const confirmNavigation = (path) => {
    if (formDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return;
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const normalizedData = {
       ...(id && {order_date:formData.order_date }),
      vendor_id: parseInt(formData.vendor_id),
      items: formData.items.map((i) => ({
        product_id: parseInt(i.product_id),
        net_cost_per_qty: parseFloat(i.net_cost_per_qty) || 0,
        ordered_qty: parseFloat(i.ordered_qty) || 0,
      })),
    };

    console.log(normalizedData);

    try {
      const endpoint = id
        ? { ...ALLEndpoint.PurchaseOrderEndpoints.updatePurchaseOrder, payload: { ...normalizedData, order_id: parseInt(id) } }
        : { ...ALLEndpoint.PurchaseOrderEndpoints.addPurchaseOrder, payload: normalizedData };

      const res = await fetch(endpoint.endpoint, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endpoint.payload),
      });

      const data = await res.json();
      if (!res.ok) {
        let errorList = [];

        if (Array.isArray(data.message)) {
          errorList = data.message;
          toast.error("Multiple errors occurred");
        } else {
          errorList = [{ message: data.message }];
          toast.error(data.message);
        }

        const newErrors = {};
        errorList.forEach((err) => {
          if (err.field?.startsWith("items.")) {
            const [, idx, fieldName] = err.field.split(".");
            if (!newErrors.items) newErrors.items = {};
            if (!newErrors.items[idx]) newErrors.items[idx] = {};
            newErrors.items[idx][fieldName] = err.message;
          } else if (err.field) {
            newErrors[err.field] = err.message;
          }
        });

        console.log(newErrors);
        setErrors(newErrors);
        return;
      }

      toast.success(id ? "Purchase order updated!" : "Purchase order created!");
      navigate(ROUTES.PURCHASE_ORDER.LIST);
    } catch (err) {
      toast.error("Error submitting purchase order");
    } finally {
      setLoading(false);
    }
  };

  const selectedProductIds = formData.items
    .map((item) => item.product_id)
    .filter(Boolean);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {id ? "✏️ Edit Purchase Order" : "➕ Add Purchase Order"}
        </h2>

        {loading && <p className="text-center text-blue-600 mb-4">Loading...</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <SearchSelect type="vendor" value={formData.vendor_name} onSelect={handleVendorSelect} selectedIds={[]} />
            {errors.vendor_id && (
              <span className="text-red-500 text-xs mt-1">{errors.vendor_id}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputField
                label="Order Date"
                type="date"
                name="order_date"
                value={formData.order_date}
                onChange={(e) => updateField("order_date", e.target.value)}
                required
                readOnly
              />
              {errors.order_date && (
                <span className="text-red-500 text-xs mt-1">{errors.order_date}</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Items <span className="text-red-500">*</span>
            </h3>

            {formData.items.map((item, index) => {
              const itemErrors = errors.items?.[index] || {};

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border rounded-lg p-4 bg-gray-50"
                >
                  <div className="md:col-span-4 flex flex-col">
                    <label className="block text-gray-700 font-medium mb-1">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <SearchSelect
                      type="product"
                      value={item.product_name}
                      onSelect={(p) => handleProductSelect(index, p)}
                      selectedIds={selectedProductIds.filter(
                        (id) => id !== item.product_id
                      )}
                    />
                    {itemErrors.product_id && (
                      <span className="text-red-500 text-xs mt-1">{itemErrors.product_id}</span>
                    )}
                  </div>

                  <div className="md:col-span-2 flex flex-col">
                    <InputField
                      label="Qty"
                      type="number"
                      name="ordered_qty"
                      value={item.ordered_qty}
                      onChange={(e) => updateItem(index, "ordered_qty", e.target.value)}
                      min="0"
                    />
                    {itemErrors.ordered_qty && (
                      <span className="text-red-500 text-xs mt-1">{itemErrors.ordered_qty}</span>
                    )}
                  </div>

                  <div className="md:col-span-3 flex flex-col">
                    <InputField
                      label="Net Cost Per Qty"
                      type="number"
                      name="net_cost_per_qty"
                      value={item.net_cost_per_qty}
                      onChange={(e) => updateItem(index, "net_cost_per_qty", e.target.value)}
                      min="0"
                      step="any"
                    />
                    {itemErrors.net_cost_per_qty && (
                      <span className="text-red-500 text-xs mt-1">{itemErrors.net_cost_per_qty}</span>
                    )}
                  </div>

                  <div className="md:col-span-2 flex justify-center items-end pb-2">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <Button type="button" variant="primary" onClick={addItem}>
              + Add Item
            </Button>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => confirmNavigation(ROUTES.PURCHASE_ORDER.LIST)}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {id ? "Update Order" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseOrderForm;