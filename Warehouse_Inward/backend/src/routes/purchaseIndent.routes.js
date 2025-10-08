import { Router } from "express";
import { getPurchaseIndentById } from "../controllers/purchaseIndent/purchaseIndent.controller.js";
import { getAllOrFiltered } from "../controllers/common/getAllSearchFilter.controller.js";
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';

const router = Router()

router.use(setEntity(ENTITY.purchaseindent));

router.get('/purchase-indent/:id',getPurchaseIndentById);
router.get('/purchase-indent', getAllOrFiltered);

export default router