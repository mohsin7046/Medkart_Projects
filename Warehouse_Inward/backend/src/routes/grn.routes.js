import { Router } from 'express'
import {
  createGRN,
  deleteGRN,
  updateGRN,
  getGRNByID
} from '../controllers/grn/grn.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'
import { updateGoodReceiptNoteSchema } from '../zodValidation/grnValidation/grnUpdate.zod.js'
import { createGoodReceiptNoteSchema } from '../zodValidation/grnValidation/grnCreate.zod.js'
import { validate } from '../middleware/zodValidate.js'
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';

const router = Router()

router.use(setEntity(ENTITY.grn));

router.post('/grn', validate(createGoodReceiptNoteSchema),createGRN)
router.get('/grn', getAllOrFiltered)
router.get('/grn/:id', getGRNByID)
router.delete('/grn', deleteGRN)
router.put('/grn', validate(updateGoodReceiptNoteSchema),updateGRN)

export default router
