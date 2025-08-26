import { NextFunction, Request, Response } from "express";
import Product from "../models/product-models";
import Wishlist from "../models/wishlist-models";
import createHttpError from "http-errors";
import { responseHandler } from "../utils/responseHandler";

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) return next(createHttpError(404, "Product not found"));

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    return responseHandler(res, 200, "Item added to wishlist.", wishlist);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return next(createHttpError(404, "Wishlist not found for this user"));
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    return responseHandler(res, 200, "Item removed from wishlist.");
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const getWishlistByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;

    let wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products"
    );

    if (!wishlist) {
      return responseHandler(res, 404, "Wishlist is empty", { items: [] });
    }

    return responseHandler(
      res,
      200,
      "User wishlist get successfully",
      wishlist
    );
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
