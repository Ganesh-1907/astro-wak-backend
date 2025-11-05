import dotenv from "dotenv";
dotenv.config(); // ✅ load env first

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { connectDB } from "./db";
import paymentRoutes from "./routes/payment.routes"; // 👈 import our routes

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json());

// --- Connect MongoDB ---
connectDB();

// --- Routes ---
app.get("/", (req, res) => {
  res.send("🚀 Astrology Payment API is running...");
});

app.use("/api", paymentRoutes); // 👈 register payment routes under /api

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
