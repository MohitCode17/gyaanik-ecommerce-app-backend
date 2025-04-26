import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

// CORS OPTIONS
const corsOption = {
  origin: process.env.FRONTEND_URL,
  credential: true,
};

app.use(cors(corsOption));

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
