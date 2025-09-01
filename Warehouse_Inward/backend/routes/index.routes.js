import { app } from "../utilities/import.config"
import bodyParser from "body-parser";
import vendorRoutes from './vendor.routes.js'
import productRoutes from './product.routes.js'
import purchaseOrderRoutes from './purchaseOrder.routes.js'
import grnRoutes from './grn.routes.js'
import purchaseInvoiceRoutes from './purchaseInvoice.routes.js'
import cors from 'cors';

app.use(bodyParser.json())
app.use(cors())
app.use('/vendors', vendorRoutes)
app.use('/products', productRoutes)
app.use('/purchase-orders', purchaseOrderRoutes)
app.use('/grn', grnRoutes)
app.use('/purchase-invoice', purchaseInvoiceRoutes)