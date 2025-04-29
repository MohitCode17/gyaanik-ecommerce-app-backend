import { NextFunction, Request, Response, Router } from "express";
import * as authController from "../controllers/auth-controller";
import { authenticate } from "../middlewares/authenticate";
import passport from "passport";
import { IUSER } from "../models/user-models";
import { generateToken } from "../utils/generateToken";

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

// LOGOUT ROUTE
router.get("/logout", authController.logout);

// AUTHENTICATE USER
router.get("/verify-auth", authenticate, authController.checkUserAuth);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}`,
    session: false,
  }),

  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as IUSER;
      const accessToken = generateToken(user);

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
