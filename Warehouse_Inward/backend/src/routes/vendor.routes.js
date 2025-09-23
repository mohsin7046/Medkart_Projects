import { Router } from 'express'
import {
  createVendor,
  getVendoreSearch,
  updateVendor,
  deleteVendor,
  getVendoreById
} from '../controllers/vendors/vendor.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'

const router = Router()

router.post('/vendors', createVendor)
router.get('/vendors', getAllOrFiltered)
router.get('/vendors/search/:q', getVendoreSearch)
router.get('/vendors/:id', getVendoreById);
router.put('/vendors', updateVendor)
router.delete('/vendors', deleteVendor)

export default router
