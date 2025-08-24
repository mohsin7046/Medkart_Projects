import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import vendorRoutes from './routes/vendor.routes.js';
import productRoutes from './routes/product.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import grnRoutes from './routes/grn.routes.js';

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/vendors', vendorRoutes);
app.use('/products', productRoutes);
app.use('/purchase-orders', purchaseOrderRoutes);
app.use('/grn', grnRoutes);

app.listen(3000, () => {
console.log('Warehouse Inward service running on port 3000');
});