import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ROUTES } from "./constant/routePath.js";
import {
  Home,
  Product,
  ProductForm,
  Vendor,
  VendorForm,
  PurchaseOrder,
  PurchaseOrderForm,
  GrnForm,
  GRN,
  PurchaseInvoice,
  PurchaseInvoiceForm,
  SalesOrder,
  SalesOrderForm,
  SalesIndent
} from "./components/importComponent.js";
import CommonView from "./components/utility/CommonView.jsx";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={1000} />
      <Home />
      <div className="">
        <Routes>
          <Route
            path={ROUTES.HOME}
            element={
              <div className="flex justify-center mt-10 text-7xl font-bold font-serif">
                WareHouse Inward System
              </div>
            }
          />
          <Route path={ROUTES.PRODUCT.LIST} element={<Product />} />
          <Route path={ROUTES.PRODUCT.ADD} element={<ProductForm />} />
          <Route path={ROUTES.PRODUCT.EDIT()} element={<ProductForm />} />

          <Route path={ROUTES.VENDOR.LIST} element={<Vendor />} />
          <Route path={ROUTES.VENDOR.ADD} element={<VendorForm />} />
          <Route path={ROUTES.VENDOR.EDIT()} element={<VendorForm />} />

          <Route path={ROUTES.PURCHASE_ORDER.LIST} element={<PurchaseOrder />} />
          <Route path={ROUTES.PURCHASE_ORDER.ADD} element={<PurchaseOrderForm />} />
          <Route path={ROUTES.PURCHASE_ORDER.EDIT()} element={<PurchaseOrderForm />} />

          <Route path={ROUTES.GRN.LIST} element={<GRN />} />
          <Route path={ROUTES.GRN.ADD()} element={<GrnForm />} />
          <Route path={ROUTES.GRN.EDIT()} element={<GrnForm />} />

          <Route path={ROUTES.PURCHASE_INVOICE.LIST} element={<PurchaseInvoice />} />
          <Route path={ROUTES.PURCHASE_INVOICE.ADD()} element={<PurchaseInvoiceForm />} />

          <Route path={ROUTES.SALES_ORDER.LIST} element={<SalesOrder />} />
       <Route path={ROUTES.SALES_ORDER.ADD} element={<SalesOrderForm />} />
          <Route path={ROUTES.SALES_ORDER.EDIT()} element={<SalesOrderForm />} />

          <Route path={ROUTES.SALES_INDENT.LIST} element={<SalesIndent />} />

          <Route path={ROUTES.COMMON_VIEW.VIEW} element={<CommonView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
