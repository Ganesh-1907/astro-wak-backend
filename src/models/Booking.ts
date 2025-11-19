import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  name: string;
  email: string;
  amount: number;
  amount_paise: number;
  bookingData: any;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  status: string;
  consultationStatus: string;   // <-- NEW
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    amount_paise: { type: Number, required: true },

    bookingData: { type: Schema.Types.Mixed, required: true },

    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },

    status: { type: String, default: "PAID" },

    // 🎯 NEW FIELD
    consultationStatus: {
      type: String,
      enum: ["Ready", "Closed"],
      default: "Ready",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
