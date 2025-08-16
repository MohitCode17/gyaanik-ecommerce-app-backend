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

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.delete("/seller/:id", authenticate, productController.deleteProduct);

router.get(
  "/seller/:sellerId",
  authenticate,
  productController.getProductBySellerId
);

export default router;
