import {Router} from "express";
import { getAllProducts ,addProduct,getProductSearch,updateProduct,deleteProduct} from "../controllers/products/product.controller.js";

const router = Router();

router.get("/getAllProducts",getAllProducts);
router.post("/add-product",addProduct);
router.get("/search/:q", getProductSearch);
router.put("/update", updateProduct);
router.delete("/deleteProduct", deleteProduct);


export default router;