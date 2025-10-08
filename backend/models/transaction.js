import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, trim: true },
    paymentMethod: { type: String, enum: ["cash", "card", "bank_transfer", "digital_wallet", "other"], default: "cash" }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
