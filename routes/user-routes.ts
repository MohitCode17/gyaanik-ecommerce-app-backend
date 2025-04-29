import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as userController from "../controllers/user-controller";

const router = Router();

router.put(
  "/profile/update/:userId",
  authenticate,
  userController.updateUserProfile
);

export default router;
