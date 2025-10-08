import { Router } from 'express'
import { getSalesIndentById } from '../controllers/sales_indent/sales_indent.controllers.js';
import { getAllOrFiltered } from '../controllers/common/getAllSearchFilter.controller.js';
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';

const router = Router();

router.use(setEntity(ENTITY.si));

router.get('/sales-indent/:id',getSalesIndentById)  
router.get('/sales-indent',getAllOrFiltered);

export default router
