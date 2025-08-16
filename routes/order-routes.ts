import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as orderController from "../controllers/order-controller";

const router = Router();

router.post("/", authenticate, orderController.createOrUpdateOrder);

router.get("/:id", authenticate, orderController.getOrderById);

router.get("/", authenticate, orderController.getOrderByUser);

router.post(
  "/payment-razorpay",
  authenticate,
  orderController.createPaymentWithRazorpay
);

router.post(
  "/razorpay-webhook",
  authenticate,
  orderController.handleRazorpayWebhook
);

export default router;
