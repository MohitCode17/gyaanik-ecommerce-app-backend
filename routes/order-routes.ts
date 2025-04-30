import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as orderController from "../controllers/order-controller";

const router = Router();

router.post("/", authenticate, orderController.createOrUpdateOrder);

router.get("/:id", authenticate, orderController.getOrderById);

router.get("/", authenticate, orderController.getOrderByUser);

export default router;
