import { NextFunction, Request, Response } from "express";
import Product from "../models/product-models";
import Cart, { ICartItem } from "../models/cart-models";
import createHttpError from "http-errors";
import { responseHandler } from "../utils/responseHandler";

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) return next(createHttpError(404, "Product not found"));

    if (product.seller.toString() === userId) {
      return next(
        createHttpError(400, "You cannot add your own product to the cart.")
      );
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem = {
        product: productId,
        quantity,
      };
      cart.items.push(newItem as ICartItem);
    }
    await cart.save();

    return responseHandler(res, 200, "Item added to cart.", cart);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return next(createHttpError(404, "Cart not found for this user"));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    return responseHandler(res, 200, "Item removed from cart.");
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const getCartByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return responseHandler(res, 404, "Cart is empty", { items: [] });
    }

    await cart.save();

    return responseHandler(res, 200, "User cart get successfully", cart);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
