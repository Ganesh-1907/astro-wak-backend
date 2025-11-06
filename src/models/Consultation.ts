import mongoose, { Schema, Document } from "mongoose";

export interface IConsultation extends Document {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  consultationType?: string;
  otherName?: string;
  otherGender?: string;
  purpose?: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  additionalInfo?: string;
  createdAt?: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    serviceType: { type: String, required: true },
    consultationType: { type: String },
    otherName: { type: String },
    otherGender: { type: String },
    purpose: { type: String },
    birthDate: { type: String, required: true },
    birthTime: { type: String, required: true },
    birthPlace: { type: String, required: true },
    additionalInfo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Consultation ||
  mongoose.model<IConsultation>("Consultation", ConsultationSchema);
