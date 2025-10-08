import {Router} from 'express';
import { createGatePass, updateGatePass,getGatePassById,getGatePassByIdView } from '../controllers/gatePass/gatePass.controller.js';
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'
import { createGatePassSchema } from "../zodValidation/gatePassValidation/createGatePass.zod.js";
import { updateGatePassSchema } from "../zodValidation/gatePassValidation/updateGatePass.zod.js";
import { validate } from '../middleware/zodValidate.js'
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';

const router = Router();

router.use(setEntity(ENTITY.gatepass));

router.post('/gate-pass',validate(createGatePassSchema),createGatePass);
router.put('/gate-pass',validate(updateGatePassSchema),updateGatePass);
router.get('/gate-pass',getAllOrFiltered);
router.get('/gate-pass/:id',getGatePassById);
router.get('/gate-pass/view/:id',getGatePassByIdView);

export default router