import { Router } from 'express'
import {
  createGRN,
  getAllGRNs,
  deleteGRN,
  updateGRN,
} from '../controllers/grn/grn.controller.js'

const router = Router()

router.post('/grn', createGRN)
router.get('/grn', getAllGRNs)
router.delete('/grn', deleteGRN)
router.put('/grn', updateGRN)

export default router
