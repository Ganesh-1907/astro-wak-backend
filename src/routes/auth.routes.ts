import express from "express";
import Admin from "../models/Admin";
import nodemailer from "nodemailer";
import path from "path";

const router = express.Router();

// ------------------------------
// ✅ Helper: Send Email with OTP
// ------------------------------
const sendOTPEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9; }
            .logo { width: 140px; height: auto; margin-bottom: 10px; }
            .content { padding: 30px 0; line-height: 1.6; }
            .otp-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: 800; color: #7c3aed; letter-spacing: 5px; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #f1f5f9; }
            .brand { color: #1e293b; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="cid:logo" alt="Astro Wak Logo" class="logo" />
                <h2 style="margin: 0; color: #1e293b;">Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hello Admin,</p>
                <p>We received a request to change your password for the <span class="brand">astroWak</span> Admin Portal. To proceed with the change, please enter the following verification code:</p>
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0; font-size: 12px; color: #64748b;">This code will expire in 10 minutes.</p>
                </div>
                <p>If you did not request this reset, please ignore this email or contact support if you have concerns.</p>
                <p>Thank you for being part of Astro Wak!</p>
                <p>Best Regards,<br/>The Astro Wak Team</p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Astro Wak Admin Portal. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"Astro Wak Support" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: "Verification Code for Astro Wak Admin",
        html: htmlContent,
        attachments: [
            {
                filename: 'astro-brahma-logo.png',
                path: '/home/ganesh/Desktop/BYV/astro-wak-website/astro-wak/public/astro-brahma-logo.png',
                cid: 'logo'
            }
        ]
    };

    await transporter.sendMail(mailOptions);
};

// ------------------------------
// 🚀 Routes
// ------------------------------

// 1️⃣ Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        // Allow login with either username or email
        const admin = await Admin.findOne({
            $or: [{ username }, { email: username }],
            password
        });

        if (admin) {
            res.json({ success: true, message: "Login successful", admin: { username: admin.username, email: admin.email } });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 2️⃣ Send OTP
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin with this email not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        admin.otp = otp;
        admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await admin.save();

        await sendOTPEmail(email, otp);
        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ success: false, message: "Error sending OTP" });
    }
});

// 3️⃣ Verify OTP
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    try {
        const admin = await Admin.findOne({ email, otp, otpExpires: { $gt: new Date() } });
        if (admin) {
            res.json({ success: true, message: "OTP verified" });
        } else {
            res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 4️⃣ Reset Password
router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const admin = await Admin.findOne({ email, otp, otpExpires: { $gt: new Date() } });
        if (!admin) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        admin.password = newPassword;
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
