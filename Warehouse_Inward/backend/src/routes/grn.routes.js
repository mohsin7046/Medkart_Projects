import { Router } from 'express'
import {
  createGRN,
  deleteGRN,
  updateGRN,
} from '../controllers/grn/grn.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'

const router = Router()

router.post('/grn', createGRN)
router.get('/grn', getAllOrFiltered)
router.delete('/grn', deleteGRN)
router.put('/grn', updateGRN)

export default router
