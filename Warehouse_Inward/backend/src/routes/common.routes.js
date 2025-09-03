import { Router } from 'express'
import { searchFilterCommon } from '../controllers/common/searchFilter.controller.js';

const router = Router();

router.get('/searchfilter',searchFilterCommon)

export default router