import express from "express";
import * as adminController from "../controllers/admin-controller";
import { authenticate } from "../middlewares/authenticate";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();

router.get("/dashboard-stats", adminController.getDashboardStats);

// APPLY BOTH MIDDLEWARE TO ALL ADMIN ROUTE
router.use(authenticate, isAdmin);

router.get("/orders", adminController.getAllOrders);
router.put("/orders/:id", adminController.updateOrder);

router.post(
  "/process-seller-payment/:orderId",
  adminController.processSellerPayment
);
router.post("/seller-payments", adminController.getSellerPayment);

export default router;
