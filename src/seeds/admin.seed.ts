import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";
import { connectDB } from "../db";

dotenv.config();

const admins = [
    {
        username: "admin1",
        email: "astroadmin@gmail.com",
        password: "astro@123",
    },
    {
        username: "admin2",
        email: "ganesh.bora@artofliving.org",
        password: "Ganesh@1907",
    },
];

const seedAdmins = async () => {
    try {
        await connectDB();
        await Admin.deleteMany({});
        await Admin.insertMany(admins);
        console.log("✅ Admin data seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding admin data:", error);
        process.exit(1);
    }
};

seedAdmins();
