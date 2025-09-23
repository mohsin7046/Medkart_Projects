import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SearchSelect } from "../utility/SearchSelect";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";

function PurchaseOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const [formData, setFormData] = useState({
    vendor_id: "",
    order_date: "",
    expected_delivery_date: "",
    items: [{ product_id: "", quantity: "", item_price: "", item_mrp: "" }],
  });

useEffect(() => {
  if (id) {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${ALLEndpoint.PurchaseOrderEndpoints.getPurchaseOrderById.endpoint}/${id}`);
        if (!res.ok) {
          toast.error("Failed to fetch the purchase Order details");
          throw new Error("Failed to fetch order");
        }
        const response = await res.json();
        const data = response.data; 
        console.log(data);
        
        let vendor_name = "";
        let vendor_id = "";
        if (data.vendor && data.vendor.status === "active") {
          vendor_name = data.vendor.name;
          vendor_id = data.vendor.id;
        }

        if(!vendor_name){
          toast.error("Vendor may be inactive")
        }

      
        const items = data.purchaseOrderItems?.map((item) => {
          let product_name = "";
          let product_id = "";
          if (item.product && item.product.status === "active") {
            product_name = item.product.name;
            product_id = item.product_id;
          }
           if(!product_name){
          toast.error("Product may be inactive")
        }
          return {
            product_id,
            product_name,
            quantity: item.quantity,
            item_price: item.item_price,
            item_mrp: item.item_mrp,
          };
        }) || [];

        setFormData({
          vendor_id,
          vendor_name,
          order_date: data.order_date ? data.order_date.slice(0, 10) : "",
          expected_delivery_date: data.expected_delivery_date ? data.expected_delivery_date.slice(0, 10) : "",
          items,
        });

        toast.success("Purchase Order details fetched successfully");
      } catch (err) {
        toast.error("Error loading purchase order");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }
}, [id]);


  const handleChange = (e) => {
    setFormDirty(true);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    setFormDirty(true);
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: "", item_price: "", item_mrp: "" }],
    }));

  const removeItem = (index) => {
    setFormDirty(true);
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleVendorSelect = (vendor) => {
    setFormDirty(true);
    setFormData((prev) => ({ ...prev, vendor_id: vendor.id }));
  };

  const handleProductSelect = (index, product) => {
    setFormDirty(true);
    const updatedItems = [...formData.items];
    updatedItems[index].product_id = product.id;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const confirmNavigation = (path) => {
    if (formDirty && !window.confirm("Entered data may be lost. Continue?")) {
      return;
    }
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const normalizedData = {
      vendor_id: formData.vendor_id,
      order_date: formData.order_date,
      expected_delivery_date: formData.expected_delivery_date,
      items: formData.items.map((item) => ({
        product_id: item.product_id,
        quantity: parseFloat(item.quantity) || 0,
        item_price: parseFloat(item.item_price) || 0,
        item_mrp: parseFloat(item.item_mrp) || 0,
      })),
    };

    try {
      let url = `${ALLEndpoint.PurchaseOrderEndpoints.addPurchaseOrder.endpoint}`;
      let method = `${ALLEndpoint.PurchaseOrderEndpoints.addPurchaseOrder.method}`;

      if (id) {
        url = `${ALLEndpoint.PurchaseOrderEndpoints.updatePurchaseOrder.endpoint}`;
        method = `${ALLEndpoint.PurchaseOrderEndpoints.updatePurchaseOrder.method}`;
        normalizedData["order_id"] = parseInt(id);
      }

      console.log(normalizedData);
      console.log(url, method);


      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedData),
      });


      if (!res.ok) {
        const resData = await res.json();

        if (Array.isArray(resData.message)) {
          resData.message.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(resData.error || resData.message || "Something went wrong");
        }
        setLoading(false);
        return;
      }

      toast.success("Purchase order saved successfully!");
      navigate(ROUTES.PURCHASE_ORDER.LIST);
    } catch (error) {
      toast.error("Error submitting purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {id ? "✏️ Edit Purchase Order" : "➕ Add Purchase Order"}
        </h2>

        {loading && <div className="text-center text-blue-600 mb-4">Loading...</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              value={formData.vendor_name}
              type="vendor"
              onSelect={handleVendorSelect}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="order_date"
                value={formData.order_date}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expected_delivery_date"
                value={formData.expected_delivery_date}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Items <span className="text-red-500">*</span></h3>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border-b pb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product <span className="text-red-500">*</span></label>
                  <SearchSelect
                    type="product"
                    value={item.product_name}
                    onSelect={(product) => handleProductSelect(index, product)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    min="0"
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="item_price"
                    value={item.item_price}
                    min="0"
                    step="any"
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                  <input
                    type="number"
                    name="item_mrp"
                    value={item.item_mrp}
                    min="0"
                    step="any"
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full border px-2 py-1 rounded focus:ring focus:ring-blue-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 text-lg"
                >
                  🗑️
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              + Add Item
            </button>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => confirmNavigation(ROUTES.PURCHASE_ORDER.LIST)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : id ? "Update Order" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseOrderForm;
