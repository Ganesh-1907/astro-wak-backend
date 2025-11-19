import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking";
import { Request, Response } from "express";
// @ts-ignore: 'resend' provides .mts types that don't resolve under current moduleResolution; use require to avoid the type-check error
const { Resend } = require("resend");

const router = express.Router();

function renderBookingDetails(data: any) {
  let html = "<h3>📌 Booking Details</h3><ul>";

  Object.keys(data.allFields).forEach((key) => {
    if (!data.allFields[key]) return;
    html += `<li><strong>${key}:</strong> ${data.allFields[key]}</li>`;
  });

  html += `<li><strong>Booking For:</strong> ${data.bookingFor}</li>`;
  html += `<li><strong>Service:</strong> ${data.title}</li>`;
  html += "</ul>";

  return html;
}

// 🧾 Create Razorpay Order
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { amount_paise } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount_paise,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json(order);
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// ✅ Verify Payment & Save Booking + Send Email
router.post("/verify-payment", async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      amount,
      amount_paise,
      bookingData,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 🔐 Verify signature
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 💾 Save booking in DB
    const booking = await Booking.create({
      name,
      email,
      amount,
      amount_paise,
      bookingData,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      status: "PAID",
    });

    // 🚀 Send success response IMMEDIATELY
    res.json({
      success: true,
      message: "Payment verified & booking saved",
      booking,
    });

    // 📧 Send Email in background (non-blocking)
    const resend = new Resend(process.env.RESEND_API_KEY);

    resend.emails
      .send({
        from: "Astro Wak <onboarding@resend.dev>", // FIXED
        to: email,
        subject: "🎉 Payment Confirmation - Astro Wak",
        html: `
          <h2>Hi ${name},</h2>
          <p>Thank you for your payment! Your astrology consultation booking is confirmed.</p>

          <h3>🧾 Payment Details</h3>
          <ul>
            <li><strong>Amount:</strong> ₹${amount}</li>
            <li><strong>Order ID:</strong> ${razorpay_order_id}</li>
            <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
            <li><strong>Status:</strong> Paid Successfully</li>
          </ul>

          ${renderBookingDetails(bookingData)}

          <p>We look forward to serving you!</p>
          <p>Best regards,<br><strong>Astro Wak Team</strong></p>
          <p><strong>Brahma Shri Jaanakiram Garu</strong></p>
          <p>+91 9553231199 | +91 9441662365</p>
        `,
      })
      .then(() => console.log("📧 Email sent"))
      .catch((err:any) => console.error("❌ Email error:", err));

  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});



export default router;
