import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import globalErrorHandler from "./middlewares/globalErrorHandler";

import authRoutes from "./routes/auth-routes";
import productRoutes from "./routes/product-routes";
import cartRoutes from "./routes/cart-routes";
import wishlistRoutes from "./routes/wishlist-routes";
import addressRoutes from "./routes/address-routes";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

// CORS OPTIONS
const corsOption = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOption));

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CONNECT WITH DATABASE
connectDB();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user/address", addressRoutes);

// CATCH GLOBAL ERRORS
app.use(globalErrorHandler);

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
