import mongoose, { Schema, Document } from "mongoose";

export interface IConsultation extends Document {
  // name: string;
  // email: string;
  // phone: string;

  serviceType: string;
  title?: string;
  price?: number;

  bookingFor: "self" | "other";

  bookingData: Record<string, any>; 

  createdAt?: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    // Basic Details
    // name: { type: String, required: true },
    // email: { type: String, required: true },
    // phone: { type: String, required: true },

    // Service Meta
    serviceType: { type: String, required: true },
    title: { type: String },
    price: { type: Number },

    bookingFor: { type: String, required: true },
    bookingData: { type: Object, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Consultation ||
  mongoose.model<IConsultation>("Consultation", ConsultationSchema);
