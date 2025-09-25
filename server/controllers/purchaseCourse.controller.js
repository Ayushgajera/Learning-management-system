// controllers/paymentController.js
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "node:crypto";
import { PurchaseCourse } from "../models/purchaseCourse.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

dotenv.config();

export const createPurchase = async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
        amount: amount * 100, // ₹ to paisa
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount / 100,
            message: "Order created successfully",
        });
    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(500).json({ error: "Order creation failed" });
    }
};

export const verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        courseId,
        userId,
        amount,
    } = req.body;
    console.log("Payment verification initiated", req.body);

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courseId ||
        !userId ||
        amount === undefined
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        // 🚀 Find the course with its instructor
        const course = await Course.findById(courseId).populate("creator"); 
        if (!course) return res.status(404).json({ error: "Course not found" });

        const instructorId = course.creator._id; // ✅ Extract instructor
        console.log("instructor id:", instructorId)

        // 💳 Save purchase record (with instructorId)
        const purchase = new PurchaseCourse({
            courseId,
            userId,
            instructorId,   // ✅ add instructorId here
            amount,
            status: "completed",
            paymentId: razorpay_payment_id,
        });
        await purchase.save();

        // ✅ Enroll user in course
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.enrolledCourses.includes(courseId)) {
            user.enrolledCourses.push(courseId);
            await user.save();
        }

        // 🚀 Add student to course
        if (!course.enrolledStudents.includes(userId)) {
            course.enrolledStudents.push(userId);
            await course.save();
        }

        // 🎉 CREDIT INSTRUCTOR WALLET
        const instructor = await User.findById(instructorId);
        const numericAmount = Number(amount);

        instructor.walletBalance = (instructor.walletBalance || 0) + numericAmount;
        instructor.walletTransactions = instructor.walletTransactions || [];
        instructor.walletTransactions.push({
            type: "credit",
            amount: numericAmount,
            courseId,
            date: new Date(),
        });

        await instructor.save();
        console.log("✅ Wallet updated:", instructor.walletBalance);

        res.json({
            success: true,
            message: "Payment verified, course enrolled, purchase saved, wallet credited",
            purchase,
        });
    } catch (err) {
        console.error("Payment verification error:", err);
        res.status(500).json({ error: "Server error during verification" });
    }
};



export const getUserPurchases = async (req, res) => {
    // Accept courseId and userId from query or params for flexibility
    const courseId = req.query.courseId || req.params.courseId;
    const userId = req.id;
    console.log(courseId, userId)

    // Validate ObjectIds
    if (!courseId || !userId) {
        return res.status(400).json({ error: "Invalid courseId or userId" });
    }

    try {
        // Find the course and check if purchased
        const course = await Course.findById(courseId)
            .populate({ path: 'creator' })
            .populate({ path: "lectures" });

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const purchased = await PurchaseCourse.findOne({ userId, courseId });
        console.log(purchased)

        const user = await User.findById(userId);

        const isActuallyEnrolled =
            purchased && user.enrolledCourses.some(c => String(c) === String(courseId));

        res.json({
            success: true,
            course,
            purchased: !!isActuallyEnrolled
        });

    } catch (err) {
        console.error("Error fetching user purchases:", err);
        res.status(500).json({ error: "Server error fetching purchases" });
    }
};


export const withdrawFromWallet = async (req, res) => {
    // User ID is attached to the request by the auth middleware
    const userId = req.id;
    const { amount } = req.body;

    // Input validation: Check if the amount is provided
    if (amount === undefined || amount === null) {
        return res.status(400).json({ success: false, message: 'Withdrawal amount is required' });
    }

    const withdrawAmount = parseFloat(amount);

    // Input validation: Check if the amount is a valid positive number
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Please enter a valid amount to withdraw' });
    }

    try {
        // Find the user and check their wallet balance
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.walletBalance < withdrawAmount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Update the user's wallet balance
        // We use -= here, which is fine, but storing the amount as negative is better for a transaction ledger
        user.walletBalance -= withdrawAmount;

        // Create a new payout transaction record
        // ✅ The amount is now stored as a negative number to reflect the withdrawal
        const newPayoutTransaction = {
            type: 'payout',
            amount: -withdrawAmount,
            date: new Date().toISOString(),
            description: `Withdrawal of ${withdrawAmount}`,
        };
    

        // Add the new transaction to the beginning of the array
        user.walletTransactions.unshift(newPayoutTransaction);
        await user.save();

        res.status(200).json({
            success: true,
            message: `Successfully withdrew ${withdrawAmount} from your wallet.`,
            user: {
                _id: user._id,
                walletBalance: user.walletBalance,
                walletTransactions: user.walletTransactions,
            }
        });

    } catch (error) {
        console.error("Error withdrawing from wallet:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
