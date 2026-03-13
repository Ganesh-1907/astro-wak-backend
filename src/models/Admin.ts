import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
    username: string;
    email: string;
    password: string;
    otp?: string;
    otpExpires?: Date;
}

const AdminSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        otp: { type: String },
        otpExpires: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", AdminSchema);
