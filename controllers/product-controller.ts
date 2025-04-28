import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { uploadToCloudinary } from "../config/cloudinaryConfig";
import Product from "../models/product-models";
import { responseHandler } from "../utils/responseHandler";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      subject,
      category,
      condition,
      classType,
      price,
      author,
      edition,
      description,
      finalPrice,
      shippingCharge,
      paymentMode,
      paymentDetails,
    } = req.body;

    const sellerId = req?.id;

    const images = req.files as Express.Multer.File[];

    if (!images || images.length === 0) {
      return next(createHttpError(400, "Image is required"));
    }

    let parsedPaymentDetails = JSON.parse(paymentDetails);

    if (
      paymentMode === "UPI" &&
      (!parsedPaymentDetails || !parsedPaymentDetails.upiId)
    ) {
      return next(createHttpError(400, "UPI id is required for payment"));
    }

    if (
      paymentMode === "Bank Account" &&
      (!parsedPaymentDetails ||
        !parsedPaymentDetails.bankDetails ||
        !parsedPaymentDetails.bankDetails.accountNumber ||
        !parsedPaymentDetails.bankDetails.ifscCode ||
        !parsedPaymentDetails.bankDetails.bankName)
    ) {
      return next(
        createHttpError(400, "Bank account details are required for payment")
      );
    }

    // UPLOAD FILE TO CLOUDINARY
    const uploadPromise = images.map((file) => uploadToCloudinary(file as any));
    const uploadImages = await Promise.all(uploadPromise);
    const imageUrl = uploadImages.map((image) => image.secure_url);

    const product = new Product({
      title,
      subject,
      category,
      condition,
      classType,
      price,
      author,
      edition,
      description,
      finalPrice,
      shippingCharge,
      seller: sellerId,
      paymentMode,
      paymentDetails: parsedPaymentDetails,
      images: imageUrl,
    });

    await product.save();

    return responseHandler(res, 201, "Product created successfully", product);
  } catch (error) {
    console.error("Error during create a product:", error);

    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
