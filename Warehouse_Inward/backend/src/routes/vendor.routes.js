import { Router } from 'express'
import {
  createVendor,
  getAllVendors,
  getVendoreSearch,
  updateVendor,
  deleteVendor,
  searchFilterVendor
} from '../controllers/vendors/vendor.controller.js'

const router = Router()

router.post('/add-vendor', createVendor)
router.get('/getAllvendor?page&limit&orderBy', getAllVendors)
router.get('/search/:q', getVendoreSearch)
router.put('/update', updateVendor)
router.delete('/deleteVendor', deleteVendor)
router.delete('/seachfilter?search&page&limit', searchFilterVendor)

export default router
