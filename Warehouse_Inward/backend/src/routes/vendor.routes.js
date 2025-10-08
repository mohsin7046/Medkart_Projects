import { Router } from 'express'
import {
  createVendor,
  getVendoreSearch,
  updateVendor,
  deleteVendor,
  getVendoreById
} from '../controllers/vendors/vendor.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'
import { updateVendorSchema } from '../zodValidation/vendorValidation/vendorUpdate.zod.js'
import { createVendorSchema } from '../zodValidation/vendorValidation/vendorCreate.zod.js'
import { validate } from '../middleware/zodValidate.js'
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';

const router = Router()

router.use(setEntity(ENTITY.vendor));

router.post('/vendors',validate(createVendorSchema), createVendor)
router.get('/vendors', getAllOrFiltered)
router.get('/vendors/search/:q', getVendoreSearch)
router.get('/vendors/:id', getVendoreById);
router.put('/vendors',validate(updateVendorSchema), updateVendor)
router.delete('/vendors', deleteVendor)

export default router
