import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUSER extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  profilePicture?: string;
  phoneNumber?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  agreeTerms: boolean;
  address: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  role: "user" | "admin";
}

// USER SCHEMA
const userSchema = new mongoose.Schema<IUSER>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    googleId: { type: String },
    profilePicture: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    agreeTerms: { type: Boolean, default: false },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// HASH PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);

  next();
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUSER>("User", userSchema);
