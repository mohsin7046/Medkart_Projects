import { Router } from 'express'
import {
  createVendor,
  getAllVendors,
  getVendoreSearch,
  updateVendor,
  deleteVendor,

} from '../controllers/vendors/vendor.controller.js'

const router = Router()

router.post('/vendors', createVendor)
router.get('/vendors', getAllVendors)
router.get('/vendors/:q', getVendoreSearch)
router.put('/vendors', updateVendor)
router.delete('/vendors', deleteVendor)

export default router
