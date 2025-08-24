import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Product from "./components/ProductMaster/Product";
import Vendor from "./components/VendorMaster/Vendor";
import PurchaseOrder from "./components/PurchaseOrder/PurchaseOrder";
import PurchaseOrderForm from "./components/PurchaseOrder/PurchaseForm";
import ProductForm from "./components/ProductMaster/productForm";
import VendorForm from "./components/VendorMaster/vendorForm";
import GrnForm from "./components/GoodReceiptNote/grnForm";
import GRN from "./components/GoodReceiptNote/grn"; 
import GRNView from "./components/GoodReceiptNote/grnView";

function App() {
  return (
    <Router>
      <Home />
      <div className=""> 
        <Routes>
          <Route path="/" element={<div className="flex justify-center mt-10 text-7xl font-bold font-serif">WareHouse Inward System</div>} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/add" element={<ProductForm />} />
          <Route path="/product/edit/:id" element={<ProductForm />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/vendor/add" element={<VendorForm />} />
          <Route path="/vendor/edit/:id" element={<VendorForm />} />
          <Route path="/purchase-order" element={<PurchaseOrder />} />
          <Route path="/purchase-order/add" element={<PurchaseOrderForm />} />
          <Route path="/purchase-order/edit/:id" element={<PurchaseOrderForm />} />
          <Route path="/grn/add" element={<GrnForm />} />
          <Route path="/grn" element={<GRN />} />
          <Route path="/grn/view/:id" element={<GRNView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

