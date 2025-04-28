import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import * as productController from "../controllers/product-controller";
import { multerMiddleware } from "../config/cloudinaryConfig";

const router = Router();

router.post(
  "/",
  authenticate,
  multerMiddleware,
  productController.createProduct
);

router.get("/", authenticate, productController.getProducts);

router.get("/:id", authenticate, productController.getProductById);

export default router;
