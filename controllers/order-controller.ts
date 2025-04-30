import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Cart from "../models/cart-models";
import Order from "../models/order-models";
import { responseHandler } from "../utils/responseHandler";

export const createOrUpdateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;

    const {
      orderId,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentDetails,
    } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return next(createHttpError(400, "Cart is empty"));
    }

    let order = await Order.findOne({ _id: orderId });

    if (order) {
      order.shippingAddress = shippingAddress || order.shippingAddress;
      order.paymentMethod = paymentMethod || order.paymentMethod;
      order.totalAmount = totalAmount || order.totalAmount;
      if (paymentDetails) {
        order.paymentDetails = paymentDetails;
        order.paymentStatus = "complete";
        order.status = "processing";
      }
    } else {
      order = new Order({
        user: userId,
        items: cart.items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentDetails,
        paymentStatus: paymentDetails ? "complete" : "pending",
      });
    }

    await order.save();

    if (paymentDetails) {
      await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    }

    return responseHandler(
      res,
      200,
      "Order created or updated successfully",
      order
    );
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({ path: "items.product", model: "Product" });

    if (!order) {
      return next(createHttpError(404, "Order not Found"));
    }

    return responseHandler(res, 200, "Order fetched successfully", order);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const getOrderByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate({ path: "items.product", model: "Product" });

    return responseHandler(
      res,
      200,
      "Order fetched successfully by user id",
      orders
    );
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
