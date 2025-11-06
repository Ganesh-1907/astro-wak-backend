import express from "express";
import Booking from "../models/Booking";

const router = express.Router();

/**
 * ✅ GET all bookings with filters, search, and sorting
 * Example:
 * GET /api/bookings?search=ganesh&from=2025-11-01&to=2025-11-05&sort=asc
 */
router.get("/", async (req, res) => {
  try {
    const { search, from, to, sort = "desc" } = req.query;

    // Build query object dynamically
    const query: any = {};

    // 🔍 Search filter (matches multiple fields)
    if (search && typeof search === "string") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { razorpay_order_id: { $regex: search, $options: "i" } },
        { razorpay_payment_id: { $regex: search, $options: "i" } },
      ];
    }

    // 📅 Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from as string);
      if (to) {
        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    // 🧾 Sorting (default: newest first)
    const sortOrder = sort === "asc" ? 1 : -1;

    // 🚀 Fetch filtered + sorted bookings
    const bookings = await Booking.find(query).sort({ createdAt: sortOrder });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});

export default router;
