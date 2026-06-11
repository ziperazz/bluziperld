import express from "express";
import {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";

import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getProducts);

// دریافت محصول با slug
router.get("/:slug", getProductBySlug);

// ساخت محصول + آپلود چند عکس
router.post("/", upload.array("images", 5), createProduct);

// ویرایش محصول
router.put("/:id", upload.array("images", 5), updateProduct);

// حذف محصول
router.delete("/:id", deleteProduct);

export default router;
