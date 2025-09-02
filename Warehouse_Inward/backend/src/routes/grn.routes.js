import { Router } from 'express'
import {
  createGRN,
  getAllGRNs,
  deleteGRN,
  updateGRN,
  searchFilterGRN
} from '../controllers/grn/grn.controller.js'


const router = Router()

router.post('/create-grn', createGRN)
router.get('/get-grn?page&limit&orderBy', getAllGRNs)
router.get('/searchfilter?search&page&limit', searchFilterGRN)
router.delete('/delete-grn', deleteGRN)
router.put('/update-grn', updateGRN)

export default router
