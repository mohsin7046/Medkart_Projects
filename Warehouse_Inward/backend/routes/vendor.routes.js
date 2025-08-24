import {Router} from "express";
import { createVendor, getAllVendors,getVendoreSearch,updateVendor,deleteVendor } from "../controllers/vendors/vendor.controller.js";

const router = Router();

router.post("/add-vendor", createVendor);
router.get("/getAllvendor", getAllVendors);
router.get("/search/:q", getVendoreSearch);
router.put("/update", updateVendor);
router.delete("/deleteVendor", deleteVendor)

export default router;

