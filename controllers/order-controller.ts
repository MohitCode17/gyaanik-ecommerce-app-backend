import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Cart from "../models/cart-models";
import Order from "../models/order-models";
import { responseHandler } from "../utils/responseHandler";
import Razorpay from "razorpay";
import crypto from "crypto";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

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

export const createPaymentWithRazorpay = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return next(createHttpError(404, "Order not Found"));
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order?._id.toString(),
    });

    return responseHandler(
      res,
      200,
      "Razorpay order and payment created successfully",
      { order: razorpayOrder }
    );
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
      const paymentId = req.body.payload.payment.entity.id;
      const orderId = req.body.payload.payment.entity.order.id;

      await Order.findOneAndUpdate(
        {
          "paymentDetails.razorpay_order_id": orderId,
        },
        {
          paymentStatus: "complete",
          status: "processing",
          "paymentDetails.razorpay_payment_id": paymentId,
        }
      );

      return responseHandler(res, 200, "Webhook processed successfully");
    } else {
      return responseHandler(res, 400, "Invalid signature");
    }
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
