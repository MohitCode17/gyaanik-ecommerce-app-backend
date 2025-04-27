import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import globalErrorHandler from "./middlewares/globalErrorHandler";

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
app.use(cookieParser());

// CONNECT WITH DATABASE
connectDB();

// ROUTES

// CATCH GLOBAL ERRORS
app.use(globalErrorHandler);

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
