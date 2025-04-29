import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as cartController from "../controllers/cart-controller";

const router = Router();

router.post("/add", authenticate, cartController.addToCart);

router.get("/:userId", authenticate, cartController.getCartByUser);

router.delete(
  "/remove/:productId",
  authenticate,
  cartController.removeFromCart
);

export default router;
