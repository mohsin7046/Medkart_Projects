
export const defaultEndPoint = 'http://localhost:5000/api/v1';

export const ALLEndpoint = Object.freeze({
  ProductEndpoints: {
    getProduct: {
      method: "GET",
      endpoint: `${defaultEndPoint}/products`
    },
    addProduct: {
      method: "POST",
      endpoint: `${defaultEndPoint}/products`
    },
    deleteProduct: {
      method: "DELETE",
      endpoint: `${defaultEndPoint}/products`
    },
    updateProduct: {
      method: "PUT",
      endpoint: `${defaultEndPoint}/products`
    },
    getProductById:{
      method: "GET",
      endpoint: `${defaultEndPoint}/products`
    },
    searchProduct: {
      method: "GET",
      endpoint: `${defaultEndPoint}/products/search/:q`
    },
    getCombinations:{
      method: "GET",
      endpoint: `${defaultEndPoint}/products/combinations`
    },
    getCategories:{
      method: "GET",
      endpoint: `${defaultEndPoint}/products/categories`
    }
  },

  VendorEndpoints: {
    getVendor: {
      method: "GET",
      endpoint: `${defaultEndPoint}/vendors`
    },
    addVendor: {
      method: "POST",
      endpoint: `${defaultEndPoint}/vendors`
    },
    deleteVendor: {
      method: "DELETE",
      endpoint: `${defaultEndPoint}/vendors`
    },
    updateVendor: {
      method: "PUT",
      endpoint: `${defaultEndPoint}/vendors`
    },
    getVendorById: {
      method: "GET",
      endpoint: `${defaultEndPoint}/vendors`
    },
    searchVendor: {
      method: "GET",
      endpoint: `${defaultEndPoint}/vendors/search/:q`
    }
  },

  PurchaseOrderEndpoints: {
    getPurchaseOrder: {
      method: "GET",
      endpoint: `${defaultEndPoint}/purchase-order`
    },
    addPurchaseOrder: {
      method: "POST",
      endpoint: `${defaultEndPoint}/purchase-order`
    },
    deletePurchaseOrder: {
      method: "DELETE",
      endpoint: `${defaultEndPoint}/purchase-order`
    },
    updatePurchaseOrder: {
      method: "PUT",
      endpoint: `${defaultEndPoint}/purchase-order`
    },
    getPurchaseOrderById: {
      method: "GET",
      endpoint: `${defaultEndPoint}/purchase-order`
    },
  },

  PurchaseInvoiceEndpoints: {
    getPurchaseInvoice: {
      method: "GET",
      endpoint: `${defaultEndPoint}/purchase-invoice`
    },
    addPurchaseInvoice: {
      method: "POST",
      endpoint: `${defaultEndPoint}/purchase-invoice`
    },
    deletePurchaseInvoice: {
      method: "DELETE",
      endpoint: `${defaultEndPoint}/purchase-invoice`
    },
    getPurchaseInvoiceById: {
      method: "GET",
      endpoint: `${defaultEndPoint}/purchase-invoice`
    },
  },

  GRNEndpoints: {
    getGRN: {
      method: "GET",
      endpoint: `${defaultEndPoint}/grn`
    },
    addGRN: {
      method: "POST",
      endpoint: `${defaultEndPoint}/grn`
    },
    deleteGRN: {
      method: "DELETE",
      endpoint: `${defaultEndPoint}/grn`
    },
    updateGRN: {
      method: "PUT",
      endpoint: `${defaultEndPoint}/grn`
    },
    getGRNById: {
      method: "GET",
      endpoint: `${defaultEndPoint}/grn`
    },
  },

  SalesOrderEndpoints:{
    getSalesOrder:{
      method:"GET",
      endpoint:`${defaultEndPoint}/sales-order`
    },
    addSalesOrder: {
      method: "POST",
      endpoint: `${defaultEndPoint}/sales-order`
    },
    deleteSalesOrder: {
      method: "DELETE",
      endpoint: `${defaultEndPoint}/sales-order`
    },
    updateSalesOrder: {
      method: "PUT",
      endpoint: `${defaultEndPoint}/sales-order`
    },
    getSalesOrderById: {
      method: "GET",
      endpoint: `${defaultEndPoint}/sales-order`
    },
    processSalesOrder:{
      method: "POST",
      endpoint: `${defaultEndPoint}/sales-order/process`
    },
    confirmSalesOrder:{
      method: "POST",
      endpoint: `${defaultEndPoint}/sales-order/confirm`
    },
    getSalesOrderEdit:{
       method: "GET",
      endpoint: `${defaultEndPoint}/sales-order/edit`
    }
  },

  SalesIndentEndpoints:{
    getSalesIndent:{
      method:"GET",
      endpoint:`${defaultEndPoint}/sales-indent`
    },
    getSalesIndentById: {
      method: "GET",
      endpoint: `${defaultEndPoint}/sales-indent`
    },
  },

  PurchaseIndentEnpoints:{
    getPurchaseIndent:{
      method:"GET",
      endpoint:`${defaultEndPoint}/purchase-indent`
    },
    getPurchaseIndentById: {
      method: "GET",
      endpoint: `${defaultEndPoint}/purchase-indent`
    },
  },

  GatePassEndpoints:{
    addGatePass: {
      method: "POST",
      endpoint: `${defaultEndPoint}/gate-pass`
    },
    updateGatePass: {
      method: "PUT",
      endpoint: `${defaultEndPoint}/gate-pass`
    },
    getGatePass:{
      method:'GET',
      endpoint: `${defaultEndPoint}/gate-pass`
    },
    getGatePassById:{
      method:'GET',
      endpoint: `${defaultEndPoint}/gate-pass`
    },
    getGatePassByIdView:{
      method:'GET',
      endpoint: `${defaultEndPoint}/gate-pass/view`
    }
  },

  Mrp_ptr_ratio_Endpoints:{
    add_mrp_ptr_ratio: {
      method: "POST",
      endpoint: `${defaultEndPoint}/mrp_ptr_mapping`
    },
    update_mrp_ptr_ratio: {
      method: "PUT",
      endpoint: `${defaultEndPoint}/mrp_ptr_mapping`
    },
     get_mrp_ptr_ratioById:{
      method:'GET',
      endpoint: `${defaultEndPoint}/mrp_ptr_mapping`
    },
     get_mrp_ptr_ratio:{
      method:'GET',
      endpoint: `${defaultEndPoint}/mrp_ptr_mapping`
    }
  }
});
