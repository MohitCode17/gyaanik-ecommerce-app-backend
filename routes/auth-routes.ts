import { Router } from "express";
import * as authController from "../controllers/auth-controller";

const router = Router();

// REGISTER ROUTES
router.post("/register", authController.register);

export default router;
