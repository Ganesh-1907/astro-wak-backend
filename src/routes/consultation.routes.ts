import express from "express";
import Consultation from "../models/Consultation";

const router = express.Router();

// ✅ POST - Save Consultation
router.post("/", async (req, res) => {
  try {
    const newConsultation = new Consultation(req.body);
    await newConsultation.save();
    res.status(201).json({ success: true, message: "Consultation saved successfully" });
  } catch (error: any) {
    console.error("Error saving consultation:", error);
    res.status(500).json({ success: false, message: "Failed to save consultation" });
  }
});

// ✅ GET - Fetch All Consultations
router.get("/", async (req, res) => {
  try {
    const { search, serviceType, from, to, sort } = req.query;

    const filter: any = {};

    // 🔍 Search by name, email, or phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // 🧭 Filter by service type
    if (serviceType && serviceType !== "all") {
      filter.serviceType = serviceType;
    }

    // 📅 Filter by date range
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    // 🕒 Sort (default: newest first)
    const sortOrder = sort === "asc" ? 1 : -1;

    const consultations = await Consultation.find(filter).sort({
      createdAt: sortOrder,
    });

    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    console.error("❌ Error fetching consultations:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch consultations" });
  }
});

export default router;
