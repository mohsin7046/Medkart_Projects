import { app } from '../utilities/import.config.js'
import vendorRoutes from './vendor.routes.js'
import productRoutes from './product.routes.js'
import purchaseOrderRoutes from './purchaseOrder.routes.js'
import grnRoutes from './grn.routes.js'
import purchaseInvoiceRoutes from './purchaseInvoice.routes.js'
import SalesOrderRoutes from './salesOrder.routes.js'
import IndentRoutes from './salesIndent.routes.js'
import PurchaseIndentRoutes from '../routes/purchaseIndent.routes.js'
import { errorHandler } from '../middleware/errorHandler.middleware.js'
import { getMainMetrics, requestMetricsMiddleware } from '../metricsRegistry/metrics.js'
import Mrp_Ptr_Ration_Routes from './product_vendor_ptr_mrp_ration.routes.js'
import GatePassRoutes from './gatePass.routes.js'

let str = '/api/v1'

app.use(requestMetricsMiddleware)

app.use(str, vendorRoutes)
app.use(str, productRoutes)
app.use(str, purchaseOrderRoutes)
app.use(str, grnRoutes)
app.use(str, purchaseInvoiceRoutes)
app.use(str,SalesOrderRoutes)
app.use(str,IndentRoutes)
app.use(str,PurchaseIndentRoutes)
app.use(str,Mrp_Ptr_Ration_Routes)
app.use(str,GatePassRoutes)

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4')
  res.end(await getMainMetrics())
})

app.use(errorHandler)

