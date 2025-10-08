import { Router } from "express";
import { CreateProductVendorMrpPtrRation, getProductVendorMrpPtrRationById, updateProductVendorMrpPtrRation } from "../controllers/product_vendor_ptr_mrp_ration.controller.js";
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'

const router = Router();

router.post('/mrp_ptr_mapping',CreateProductVendorMrpPtrRation)
router.put('/mrp_ptr_mapping',updateProductVendorMrpPtrRation)
router.get('/mrp_ptr_mapping',getAllOrFiltered)
router.get('/mrp_ptr_mapping/:id',getProductVendorMrpPtrRationById)

export default router
