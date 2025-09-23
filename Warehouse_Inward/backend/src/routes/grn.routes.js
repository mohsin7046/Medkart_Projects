import { Router } from 'express'
import {
  createGRN,
  deleteGRN,
  updateGRN,
  getGRNByID
} from '../controllers/grn/grn.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'

const router = Router()

router.post('/grn', createGRN)
router.get('/grn', getAllOrFiltered)
router.get('/grn/:id', getGRNByID)
router.delete('/grn', deleteGRN)
router.put('/grn', updateGRN)

export default router
