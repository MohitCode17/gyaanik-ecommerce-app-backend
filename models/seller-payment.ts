import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface ISellerPayment extends Document {
  seller: mongoose.Types.ObjectId; // Kis user ne book sell kia hai
  order: mongoose.Types.ObjectId; // kisne uss book ke lia purchase order kia hai
  product: mongoose.Types.ObjectId; // kya product hai
  amount: number;
  paymentMethod: string;
  paymentStatus: "pending" | "complete" | "failed";
  processedBy: mongoose.Types.ObjectId;
  notes?: string;
}

const sellerPaymentSchema = new mongoose.Schema<ISellerPayment>(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "complete", "failed"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISellerPayment>(
  "SellerPayment",
  sellerPaymentSchema
);
