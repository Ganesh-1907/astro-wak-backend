import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables first

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { connectDB } from "./db";
import paymentRoutes from "./routes/payment.routes";
import bookingsRoutes from "./routes/bookings.routes";
import consultationRoutes from "./routes/consultation.routes";

const app = express();

// ------------------------------
// ✅ Configure CORS (Fix for Render + Frontend)
// ------------------------------
const allowedOrigins = [
  "http://localhost:8080",        // Local development frontend
  "https://astro-wak.vercel.app", // Production frontend (update if needed)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight requests automatically (Express 5 compatible)
app.options(/.*/, cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ------------------------------
// 🔧 Middlewares
// ------------------------------
app.use(bodyParser.json());

// ------------------------------
// 🌐 Connect MongoDB
// ------------------------------
connectDB();

// ------------------------------
// 🚀 Routes
// ------------------------------
app.get("/", (req, res) => {
  res.send("🚀 Astrology Payment API is running...");
});

app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/consultations", consultationRoutes);

// ------------------------------
// ⚡ Start Server
// ------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
