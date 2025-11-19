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
    const { search, from, to, sort = "desc", status, serviceType } = req.query;

    const query: any = {};

    // 🔍 Search
    if (search && typeof search === "string") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { razorpay_order_id: { $regex: search, $options: "i" } },
        { razorpay_payment_id: { $regex: search, $options: "i" } },
      ];
    }

    // 📅 Date Range
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from as string);
      if (to) {
        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    // 🟧 Filter by Consultation Status
    if (status && status !== "all") {
      query.consultationStatus = status;
    }

    // 🟦 Filter by Service Type
    if (serviceType && serviceType !== "all") {
      query["bookingData.title"] = serviceType;
    }

    // 🔽 Sort
    const sortOrder = sort === "asc" ? 1 : -1;

    // 🚀 Fetch bookings
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


router.put("/:id/close", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { consultationStatus: "Closed" },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
});


export default router;
