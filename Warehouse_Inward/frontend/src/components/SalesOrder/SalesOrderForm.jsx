import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";
import { SearchSelect } from "../utility/SearchSelect.jsx";

function SalesOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
    order_type: "B2C",
    items: [{ product_id: "", product_name: "", vendor_id: "", ordered_qty: "", product_mrp: "", product_price: "" }],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${ALLEndpoint.SalesOrderEndpoints.getSalesOrderEdit.endpoint}/${id}`);

        const {data} = await res.json();

        const items = data.items?.map((i) => ({
          product_id: i.product_id || "",
          vendor_id: i.vendor_id || "",
          product_name: i.product_name || "",
          ordered_qty: i.ordered_qty?.toString() || "",
          product_mrp: i.product_mrp?.toString() || "",
          product_price: i.product_price?.toString() || "",
        })) || [];

        setFormData({
          name: data.name || "",
          email: data.email || "",
          contact_number: data.contact_number || "",
          address: data.address || "",
          order_type: data.order_type || "B2C",
          items,
        });

      } catch (err) {
        toast.error("Error loading sales order");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateField = (name, value) => {
    console.log(name, value);

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
      items: [...prev.items, { product_id: "", product_name: "", ordered_qty: "", product_mrp: "", product_price: "" }],
    }));

  const removeItem = (index) =>
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const handleProductSelect = (index, product) => {
    updateItem(index, "product_id", product.id);
    updateItem(index, "product_name", product.name);
    updateItem(index, "product_mrp", product.product_mrp);
    updateItem(index, "product_price", product.product_price);
    updateItem(index, "vendor_id", product.vendor_id || "");
  };

  const confirmNavigation = (path) => {
    if (formDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return;
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...(id && { sales_order_id: parseInt(id) }),
      name: formData.name,
      email: formData.email,
      contact_number: formData.contact_number,
      address: formData.address,
      order_type: formData.order_type,
      items: formData.items.map((i) => ({
        product_id: parseInt(i.product_id),
        ordered_qty: parseFloat(i.ordered_qty) || 0,
      })),
    };

    console.log(payload);


    try {
      const endpoint = id
        ? ALLEndpoint.SalesOrderEndpoints.updateSalesOrder
        : ALLEndpoint.SalesOrderEndpoints.addSalesOrder;

      const res = await fetch(endpoint.endpoint, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorList = Array.isArray(data.message) ? toast.error(data.message) : [{ message: data.message }];
        const newErrors = {};

        errorList.forEach(err => {
          if (err.field?.startsWith("items.")) {
            const [, idx, fieldName] = err.field.split(".");
            if (!newErrors.items) newErrors.items = {};
            if (!newErrors.items[idx]) newErrors.items[idx] = {};
            newErrors.items[idx][fieldName] = err.message;
          } else if (err.field) {
            newErrors[err.field] = err.message;
          }
        });

        setErrors(newErrors);
        return;
      }

      toast.success(id ? "Sales order updated!" : "Sales order created!");
      navigate(ROUTES.SALES_ORDER.LIST);
    } catch (err) {
      console.error(err);
      toast.error("Error submitting sales order");
    } finally {
      setLoading(false);
    }
  };

   const totalQty = formData.items.reduce((sum, item) => sum + (parseFloat(item.ordered_qty) || 0), 0);
  const totalAmount = formData.items.reduce(
    (sum, item) => sum + ((parseFloat(item.ordered_qty) || 0) * (parseFloat(item.product_price) || 0)),
    0
  );

  const selectedProductIds = formData.items
    .map((item) => item.product_id)
    .filter(Boolean);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">{id ? "✏️ Edit Sales Order" : "➕ Add Sales Order"}</h2>

        {loading && <p className="text-center text-blue-600 mb-4">Loading...</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Name" name="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} required />
            <InputField label="Email" type="email" name="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} required />
            <InputField label="Contact Number" name="contact_number" value={formData.contact_number} onChange={(e) => updateField("contact_number", e.target.value)} required />
            <InputField label="Address" name="address" value={formData.address} onChange={(e) => updateField("address", e.target.value)} />
            <select value={formData.order_type} onChange={(e) => updateField("order_type", e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Products</h3>
            {formData.items.map((item, index) => {
              const itemErrors = errors.items?.[index] || {};

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 items-start border-b pb-3"
                >
             
                  <div className="flex flex-col">
                    <SearchSelect
                      type="product"
                      value={item.product_name}
                      onSelect={(p) => handleProductSelect(index, p)}
                      selectedIds={selectedProductIds.filter(
                        (id) => id !== item.product_id
                      )}
                    />
                    {itemErrors.product_name && (
                      <span className="text-red-500 text-xs mt-1">{itemErrors.product_name}</span>
                    )}
                  </div>

                  
                  <div className="flex flex-col">
                    <InputField
                      label="Qty"
                      type="number"
                      value={item.ordered_qty}
                      onChange={(e) => updateItem(index, "ordered_qty", e.target.value)}
                      min="0"
                    />
                    {itemErrors.ordered_qty && (
                      <span className="text-red-500 text-xs mt-1">{itemErrors.ordered_qty}</span>
                    )}
                  </div>

               
                  <div className="flex flex-col">
                    <InputField label="Price" type="number" value={item.product_price} readOnly />
                  </div>

                 
                  <div className="flex flex-col">
                    <InputField label="MRP" type="number" value={item.product_mrp} readOnly />
                  </div>

                  <div className="flex flex-col justify-end mt-6">
                    <button
                      type="button"
                      className="text-red-600 text-lg"
                      onClick={() => removeItem(index)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
            <Button type="button" variant="primary" onClick={addItem}>+ Add Product</Button>
          </div>

          <div>
                <span className="font-semibold">Total Quantity: </span>
                <span>{totalQty}</span>
              </div>
              <div>
                <span className="font-semibold">Total Amount: </span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => confirmNavigation(ROUTES.SALES_ORDER.LIST)}>Back</Button>
            <Button type="submit" variant="primary" loading={loading}>{id ? "Update Order" : "Submit"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SalesOrderForm;
