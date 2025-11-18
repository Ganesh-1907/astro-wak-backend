import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("❌ MONGODB_URI missing");

  try {
    const conn = await mongoose.connect(uri, { dbName: "astroWak" });

    const db = conn.connection.db;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📦 Using Database: ${db?.databaseName || "unknown"}`);

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}
