import express from "express";
import { 
    createDiscount, 
    getAllDiscounts, 
    deleteDiscount, 
    validateDiscount 
} from "../controllers/discount.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// عمومی - اعتبارسنجی کد
router.post("/validate", validateDiscount);

// ادمین
router.get("/", protect, authorize("admin"), getAllDiscounts);
router.post("/", protect, authorize("admin"), createDiscount);
router.delete("/:id", protect, authorize("admin"), deleteDiscount);

export default router;