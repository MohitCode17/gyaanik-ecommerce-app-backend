import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as wishlistController from "../controllers/wishlist-controller";

const router = Router();

router.post("/add", authenticate, wishlistController.addToWishlist);

router.get("/:userId", authenticate, wishlistController.getWishlistByUser);

router.delete(
  "/remove/:productId",
  authenticate,
  wishlistController.removeFromWishlist
);

export default router;
