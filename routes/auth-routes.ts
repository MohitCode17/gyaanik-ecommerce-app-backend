import { Router } from "express";
import * as authController from "../controllers/auth-controller";

const router = Router();

// REGISTER ROUTES
router.post("/register", authController.register);

// LOGIN ROUTES
router.post("/login", authController.login);

// VERIFY EMAIL
router.get("/verify-email", authController.verifyEmail);

export default router;
