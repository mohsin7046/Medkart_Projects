import {Router} from 'express';
import {createGRN,getAllGRNs,deleteGRN} from '../controllers/grn/grn.controller.js';

const router = Router();

router.post('/create-grn', createGRN);
router.get('/get-grn', getAllGRNs);
router.delete('/delete-grn', deleteGRN);

export default router;