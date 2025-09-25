import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BuyCourseButton = ({ courseId, amount = 499 ,refetch}) => {
  const [loading, setLoading] = useState(false);
   const userData = useSelector((state) => state.auth.user);
   const userId = userData?._id || "ayush-user-id-demo"; 
   console.log("User ID:", userId);
  // const courseId = params.courseId;
  const navigate = useNavigate();

  // 🧠 Load Razorpay SDK
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 💸 Main Payment Handler
  const handlePayment = async () => {
    if (!amount || !courseId) {
      toast.error("Missing course or amount details.");
      return;
    }
  
    setLoading(true);
  
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load");
      setLoading(false);
      return;
    }
  
    try {
      // Step 1️⃣: Create order from backend
      const { data: orderData } = await axios.post("http://localhost:8000/api/v1/payment/create-order", {
        amount,
      },{ withCredentials: true });

      // Step 2️⃣: Setup Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // paise
        currency: orderData.currency || "INR",
        name: "LMS by Ayush",
        description: "Course Access Payment",
        order_id: orderData.orderId || orderData.id,
        handler: async function (response) {
          try {
            const { data: verifyRes } = await axios.post("http://localhost:8000/api/v1/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
              amount,
              userId: userId || null, // ✅ If not logged in, backend should handle it
            },{ withCredentials: true });
  
            if (verifyRes.success) {
              toast.success("✅ Payment successful!");
              refetch(); // refresh course access
              navigate(`/course-progress/${courseId}`);
            } else {
              toast.error("❌ Payment verification failed!");
            }
          } catch (err) {
            toast.error("❌ Error verifying payment");
            console.error("Payment Verification Error:", err);
          }
        },
        theme: {
          color: "#10B981",
          backdrop_color: "rgba(0,0,0,0.6)",
          hide_topbar: false,
        },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("❌ Failed to initiate order.");
      navigate("/unauthorized");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <button
      onClick={handlePayment}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-60"
      disabled={loading}
    >
      {loading ? "Processing..." : `Buy Now ₹${amount}`}
    </button>
  );
};

export default BuyCourseButton;
