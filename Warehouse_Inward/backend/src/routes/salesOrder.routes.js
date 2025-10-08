import { Router } from 'express'
import { createSalesOrder,updateSalesOrder,deleteSalesOrder,getSalesOrderById,processSalesOrder,getSalesOrderForEditById ,confirmSalesOrder} from '../controllers/sales_order/sales_order.controller.js';
import { getAllOrFiltered } from '../controllers/common/getAllSearchFilter.controller.js';
import { createSalesOrderSchema } from '../zodValidation/salesOrderValidation/salesCreate.zod.js'
import { updateSalesOrderSchema } from '../zodValidation/salesOrderValidation/salesUpdate.zod.js'
import { validate } from '../middleware/zodValidate.js'
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';

const router = Router();

router.use(setEntity(ENTITY.so));

router.post('/sales-order',validate(createSalesOrderSchema),createSalesOrder);
router.get('/sales-order',getAllOrFiltered);
router.get('/sales-order/:id',getSalesOrderById);
router.get('/sales-order/edit/:id',getSalesOrderForEditById);
router.delete('/sales-order',deleteSalesOrder);
router.put('/sales-order',validate(updateSalesOrderSchema),updateSalesOrder);
router.post('/sales-order/process',processSalesOrder);
router.post('/sales-order/confirm',confirmSalesOrder);

export default router