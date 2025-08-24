import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SearchSelect } from "../utility/SearchSelect";

function PurchaseOrderForm() {

  const location = useLocation();
  const passedOrderData = location.state?.order;

  console.log(passedOrderData);

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: null,
    vendor_code: "",
    order_date: "",
    order_number:"",
    expected_delivery_date: "",
    items: [{ product_code: "", quantity: "", item_price: "", item_mrp: "", totalAmount: "" }],
    total_amount: 0,
  });
  

useEffect(() => {
   if (passedOrderData) {
      setFormData({
        id: passedOrderData.id,
        vendor_code: passedOrderData.vendor_code || "",
        order_date: passedOrderData.order_date ? passedOrderData.order_date.slice(0, 16) : "",
        order_number: passedOrderData.order_number || "",
        expected_delivery_date: passedOrderData.expected_delivery_date
          ? passedOrderData.expected_delivery_date.slice(0, 16)
          : "",
        items:
          passedOrderData.purchaseOrderItems?.map((item) => ({
            product_code: item.product_code,
            quantity: item.quantity,
            item_price: item.item_price,
            item_mrp: item.item_mrp,
            totalAmount: item.totalAmount,
          })) || [],
        total_amount: passedOrderData.total_amount || 0,
      });
    }
},[passedOrderData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };

    if (name === "quantity" || name === "item_price") {
      const qty = name === "quantity" ? value : updatedItems[index].quantity;
      const price = name === "item_price" ? value : updatedItems[index].item_price;
      if (qty && price) {
        updatedItems[index].totalAmount = (qty * price).toString();
      }
    }

    const grandTotal = updatedItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    setFormData((prev) => ({ ...prev, items: updatedItems, total_amount: grandTotal }));
  };

  const addItem = () =>
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_code: "", quantity: "", item_price: "", item_mrp: "", totalAmount: "" }],
    }));

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const grandTotal = updatedItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    setFormData((prev) => ({ ...prev, items: updatedItems, total_amount: grandTotal }));
  };

  const handleVendorSelect = (vendor) =>
    setFormData((prev) => ({ ...prev, vendor_code: vendor.vendor_code }));

  const handleProductSelect = (index, product) => {
    const updatedItems = [...formData.items];
    updatedItems[index].product_code = product.product_code;
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = "http://localhost:3000/purchase-orders/add-purchase-order";
      let method = "POST";

      if (id) {
        url = "http://localhost:3000/purchase-orders/updatePurchaseOrder";
        method = "PUT";
      }

      console.log(url, method, formData);
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...formData, order_number: passedOrderData?.order_number}),
      });

      if (!res.ok) throw new Error("Failed to save purchase order");

      await res.json();
      navigate("/purchase-order");
    } catch (error) {
      console.error("Error submitting purchase order:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-xl font-bold mb-4">{id ? "Edit Purchase Order" : "Add Purchase Order"}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <SearchSelect value={formData.vendor_code} type="vendor" onSelect={handleVendorSelect} />
        <div className="flex gap-4">
          <input type="datetime-local" name="order_date" value={formData.order_date} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          <input type="datetime-local" name="expected_delivery_date" value={formData.expected_delivery_date} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 items-center">
              <SearchSelect type="product" value={item.product_code} onSelect={(product) => handleProductSelect(index, product)} />
              <input type="number" name="quantity" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, e)} className="border px-2 py-1 rounded" />
              <input type="number" name="item_price" placeholder="Price" value={item.item_price} onChange={(e) => handleItemChange(index, e)} className="border px-2 py-1 rounded" />
              <input type="number" name="item_mrp" placeholder="MRP" value={item.item_mrp} onChange={(e) => handleItemChange(index, e)} className="border px-2 py-1 rounded" />
              <input type="number" name="totalAmount" value={item.totalAmount} readOnly className="border px-2 py-1 rounded bg-gray-100" />
              <button type="button" onClick={() => removeItem(index)}>🗑️</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="px-3 py-1 bg-blue-500 text-white rounded">+ Add Item</button>
        </div>
       
        <div className="font-bold text-right">Grand Total: ₹{formData.total_amount}</div>
        <div className="flex justify-between">
          <button type="button" onClick={() => navigate("/purchase-order")} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{id ? "Update Order" : "Submit"}</button>
        </div>
      </form>
    </div>
  );
}

export default PurchaseOrderForm;
