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
    expected_delivery_date: "",
    items: [{ product_id: "", product_name: "", quantity: "", item_price: "", item_mrp: "" }],
  });


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
              quantity: item.quantity,
              item_price: item.item_price,
              item_mrp: item.item_mrp,
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
      items: [...prev.items, { product_id: "", product_name: "", quantity: "", item_price: "", item_mrp: "" }],
    }));

  const removeItem = (index) =>
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const handleVendorSelect = (vendor) => updateField("vendor_id", vendor.id);
  const handleProductSelect = (index, product) => updateItem(index, "product_id", product.id);


  const confirmNavigation = (path) => {
    if (formDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return;
    navigate(path);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const normalizedData = {
      vendor_id: formData.vendor_id,
      order_date: formData.order_date,
      expected_delivery_date: formData.expected_delivery_date,
      items: formData.items.map((i) => ({
        product_id: i.product_id,
        quantity: parseFloat(i.quantity) || 0,
        item_price: parseFloat(i.item_price) || 0,
        item_mrp: parseFloat(i.item_mrp) || 0,
      })),
    };

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
        (Array.isArray(data.message) ? data.message : [data]).forEach((err) =>
          toast.error(err.field ? `${err.field}: ${err.message}` : err.message || "Error")
        );
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {id ? "✏️ Edit Purchase Order" : "➕ Add Purchase Order"}
        </h2>

        {loading && <p className="text-center text-blue-600 mb-4">Loading...</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            
            <SearchSelect type="vendor" value={formData.vendor_name} onSelect={handleVendorSelect} />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Order Date" type="date" name="order_date" value={formData.order_date} onChange={(e) => updateField("order_date", e.target.value)} required />
            <InputField label="Expected Delivery Date" type="date" name="expected_delivery_date" value={formData.expected_delivery_date} onChange={(e) => updateField("expected_delivery_date", e.target.value)} required />
          </div>


          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Items <span className="text-red-500">*</span>
            </h3>

            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border rounded-lg p-4 bg-gray-50"
              >
       
                <div className="md:col-span-4">
                  <SearchSelect
                    type="product"
                    value={item.product_name}
                    onSelect={(p) => handleProductSelect(index, p)}
                  />
                </div>

              
                <div className="md:col-span-2">
                  <InputField
                    label="Qty"
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    min="0"
                  />
                </div>

              
                <div className="md:col-span-2">
                  <InputField
                    label="Price"
                    type="number"
                    name="item_price"
                    value={item.item_price}
                    onChange={(e) => updateItem(index, "item_price", e.target.value)}
                    min="0"
                    step="any"
                  />
                </div>

                
                <div className="md:col-span-2">
                  <InputField
                    label="MRP"
                    type="number"
                    name="item_mrp"
                    value={item.item_mrp}
                    onChange={(e) => updateItem(index, "item_mrp", e.target.value)}
                    min="0"
                    step="any"
                  />
                </div>

               
                <div className="md:col-span-2 flex justify-center ">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <Button type="button" variant="primary" onClick={addItem}>
              + Add Item
            </Button>
          </div>



          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={() => confirmNavigation(ROUTES.PURCHASE_ORDER.LIST)}>Back</Button>
            <Button type="submit" variant="primary" loading={loading}>{id ? "Update Order" : "Submit"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseOrderForm;
