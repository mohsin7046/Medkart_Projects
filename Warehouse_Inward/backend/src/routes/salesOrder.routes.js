import { Router } from 'express'
import { createSalesOrder,updateSalesOrder,deleteSalesOrder,getSalesOrderById,processSalesOrder,getSalesOrderForEditById } from '../controllers/sales_order/sales_order.controller.js';
import { getAllOrFiltered } from '../controllers/common/getAllSearchFilter.controller.js';

const router = Router();

router.post('/sales-order',createSalesOrder);
router.get('/sales-order',getAllOrFiltered);
router.get('/sales-order/:id',getSalesOrderById);
router.get('/sales-order/edit/:id',getSalesOrderForEditById);
router.delete('/sales-order',deleteSalesOrder);
router.put('/sales-order',updateSalesOrder);
router.post('/sales-order/process',processSalesOrder);

export default router