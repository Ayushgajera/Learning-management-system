import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { createPurchase, getUserPurchases, verifyPayment, withdrawFromWallet } from "../controllers/purchaseCourse.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

dotenv.config();
const router = express.Router();



// Pass razorpay instance to controller via closure
router.route("/create-order").post(isAuthenticated, createPurchase);
router.route("/verify").post(isAuthenticated, verifyPayment);
router.route("/:courseId/purchase").get(isAuthenticated, getUserPurchases);
router.route("/withdraw").post(isAuthenticated, withdrawFromWallet);

export default router;