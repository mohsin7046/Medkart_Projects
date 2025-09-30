import { Router } from "express";
import { getPurchaseIndentById } from "../controllers/purchaseIndent/purchaseIndent.controller.js";
import { getAllOrFiltered } from "../controllers/common/getAllSearchFilter.controller.js";

const router = Router()

router.get('/purchase-indent/:id',getPurchaseIndentById);
router.get('/purchase-indent', getAllOrFiltered);

export default router