import mongoose, { Document } from "mongoose";

export interface IWislist extends Document {
  products: mongoose.Types.ObjectId[];
  user: mongoose.Types.ObjectId;
}

const wishlistSchema = new mongoose.Schema<IWislist>({
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model<IWislist>("Wishlist", wishlistSchema);
