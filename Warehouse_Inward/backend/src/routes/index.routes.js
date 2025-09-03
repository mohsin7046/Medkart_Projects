import { app } from '../utilities/import.config.js'
import vendorRoutes from './vendor.routes.js'
import productRoutes from './product.routes.js'
import purchaseOrderRoutes from './purchaseOrder.routes.js'
import grnRoutes from './grn.routes.js'
import purchaseInvoiceRoutes from './purchaseInvoice.routes.js'
import commonRoutes from './common.routes.js'

let str = '/api/v1'

app.use(str, vendorRoutes)
app.use(str, productRoutes)
app.use(str, purchaseOrderRoutes)
app.use(str, grnRoutes)
app.use(str, purchaseInvoiceRoutes)
app.use(str,commonRoutes)
