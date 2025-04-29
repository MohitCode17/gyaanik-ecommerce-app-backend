import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as addressController from "../controllers/address-controller";

const router = Router();

router.post(
  "/create-or-update",
  authenticate,
  addressController.createOrUpdateAddressByUserId
);

router.get("/", authenticate, addressController.getAddressByUserId);

export default router;
