export const ROUTES = {
  HOME: "/",
  
  PRODUCT: {
    LIST: "/product",
    ADD: "/product/add",
    EDIT: (id = ":id") => `/product/edit/${id}`,
  },

  VENDOR: {
    LIST: "/vendor",
    ADD: "/vendor/add",
    EDIT: (id = ":id") => `/vendor/edit/${id}`,
  },

  PURCHASE_ORDER: {
    LIST: "/purchase-order", 
    ADD: "/purchase-order/add",
    EDIT: (id = ":id") => `/purchase-order/edit/${id}`,
    VIEW: (type = ":type",id = ':id') => `/view/${type}/${id}`
  },

  GRN: {
    LIST: "/grn",
    ADD: (id = ":id") => `/grn/add/${id}`,
    VIEW: (type = ":type",id = ':id') => `/view/${type}/${id}`,
    EDIT: (id = ":id") => `/grn/edit/${id}`,
  },

  PURCHASE_INVOICE: {
    LIST: "/purchase-invoice",
    ADD: (id = ":id") => `/purchase-invoice/add/${id}`,
   VIEW: (type = ":type",id = ':id') => `/view/${type}/${id}`
  },

  SALES_ORDER: {
    LIST: "/sales-order", 
    ADD: "/sales-order/add",
    EDIT: (id = ":id") => `/sales-order/edit/${id}`,
    VIEW: (type = ":type",id = ':id') => `/view/${type}/${id}`
  },

  SALES_INDENT: {
    LIST: "/sales-indent", 
    VIEW: (type = ":type",id = ':id') => `/view/${type}/${id}`
  },

  PURCHASE_INDENT:{
    LIST: "/purchase-indent", 
    VIEW: (type = ":type",id = ':id') => `/view/${type}/${id}`
  },

  COMMON_VIEW:{
    VIEW:'/view/:type/:id'
  }
  
};
