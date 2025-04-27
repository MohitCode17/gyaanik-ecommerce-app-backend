import { Router } from "express";
import * as authController from "../controllers/auth-controller";

const router = Router();

// REGISTER ROUTES
router.post("/register", authController.register);

// LOGIN ROUTES
router.post("/login", authController.login);

// VERIFY EMAIL
router.get("/verify-email/:token", authController.verifyEmail);

// FORGOT PASSWORD
router.post("/forgot-password", authController.forgotPassword);

// RESET PASSWORD
router.post("/reset-password/:token", authController.resetPassword);

export default router;
