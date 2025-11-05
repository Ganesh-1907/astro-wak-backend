import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking";
import nodemailer from "nodemailer";
import { Request, Response } from "express";

const router = express.Router();

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
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign === razorpay_signature) {
      // 💾 Save booking in DB
      const booking = await Booking.create({
        name,
        email,
        amount,
        amount_paise,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "PAID",
      });

      // 📧 Send confirmation email
      const transporter = nodemailer.createTransport({
        service: "gmail", // or use "smtp.mailtrap.io" for testing
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      });

      const mailOptions = {
        from: `"Astro Wak Team" <${process.env.SMTP_USER!}>`,
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

          <p>We look forward to serving you!</p>
          <p>Best regards,<br><strong>Astro Wak Team</strong></p>
          <p><strong>Brahma Shri Jaanakiram Garu</strong></p>
          <p>+91 9553231199 | +91 9441662365</p>
        `,
      };

      // send the email
      await transporter.sendMail(mailOptions);

      return res.json({
        success: true,
        message: "Payment verified, booking saved & confirmation email sent",
        booking,
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;
