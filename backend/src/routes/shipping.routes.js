import express from "express";
import { createShipping } from "../controllers/shipping.controller.js";

const router = express.Router();

router.post("/shipping", createShipping);

export default router;
