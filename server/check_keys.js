import dotenv from 'dotenv';
dotenv.config();

console.log("Checking Razorpay Keys...");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_SECRET;

if (keyId) {
    console.log("✅ RAZORPAY_KEY_ID is present: " + keyId.substring(0, 5) + "...");
} else {
    console.error("❌ RAZORPAY_KEY_ID is MISSING");
}

if (keySecret) {
    console.log("✅ RAZORPAY_SECRET is present: " + (keySecret.length > 5 ? "******" : "MISSING"));
} else {
    console.error("❌ RAZORPAY_SECRET is MISSING");
}

console.log("\nIf these are missing in production, please add them to your deployment dashboard (Render, Vercel, etc.) environment variables.");
