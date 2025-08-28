import { NextFunction, Request, Response } from "express";
import SellerPayment from "../models/seller-payment";
import Order from "../models/order-models";
import User from "../models/user-models";
import Product from "../models/product-models";
import { responseHandler } from "../utils/responseHandler";
import createHttpError from "http-errors";

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;

    const paidOrderRecord = await SellerPayment.find().select("order");
    const paidOrderIds = paidOrderRecord.map((record) =>
      record.order.toString()
    );

    const query: any = {
      paymentStatus: "complete",
      _id: { $nin: paidOrderIds },
    };

    if (status) {
      query.status = status;
    }

    query.paymentStatus = paymentStatus || "complete";

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const orders = await Order.find(query)
      .populate({
        path: "items.product",
        populate: {
          path: "seller",
          select: "name email phoneNumber paymentMode paymentDetails",
        },
      })
      .populate("user", "name email")
      .populate("shippingAddress")
      .sort({ createdAt: -1 });

    return responseHandler(res, 200, "Order fetched successfully", orders);
  } catch (error) {
    console.log("Error fetching orders", error);
    return next(createHttpError(500, "Internal server error"));
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(id);

    if (!order) {
      return responseHandler(res, 404, "Order not found");
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    return responseHandler(res, 200, "Order updated successfully", order);
  } catch (error) {
    console.log("Error updating order", error);
    return next(createHttpError(500, "Internal server error"));
  }
};

export const processSellerPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { productId, paymentMethod, amount, notes } = req.body;
    const user = req.id;

    if (!productId || !paymentMethod || !amount) {
      return responseHandler(res, 400, "Missing required fields");
    }

    const order = await Order.findById(orderId).populate({
      path: "items.product",
      populate: {
        path: "seller",
      },
    });

    if (!order) {
      return responseHandler(res, 404, "Order not found");
    }

    // find the specific product in the order
    const orderItem = order.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (!orderItem) {
      return responseHandler(res, 404, "Product not found in the order");
    }

    const sellerPayment = new SellerPayment({
      seller: (orderItem.product as any).seller._id,
      order: orderId,
      product: productId,
      amount,
      paymentMethod,
      paymentStatus: "complete",
      processedBy: user,
      notes,
    });

    await sellerPayment.save();
    return responseHandler(
      res,
      200,
      "Payment to seller processed successfully"
    );
  } catch (error) {
    console.log("Error processed payment", error);
    return next(createHttpError(500, "Internal server error"));
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      statusCounts,
      recentOrders,
      revenue,
      monthlySales,
    ] = await Promise.all([
      // GET COUNTS
      Order.countDocuments().lean(),
      User.countDocuments().lean(),
      Product.countDocuments().lean(),

      // GET ORDER BY STATUS IN SINGLE QUERY
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // GET RECENT ORDERS
      Order.find()
        .select("user totalAmount status createdAt")
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // CALCULATE REVENUE
      Order.aggregate([
        { $match: { paymentStatus: "complete" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // GET MONTHLY SALES DATA FOR CHART
      Order.aggregate([
        { $match: { paymentStatus: "complete" } },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // PROCESS STATUS COUNTS
    const orderByStatus = {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item: any) => {
      const status = item._id as keyof typeof orderByStatus;
      if (orderByStatus.hasOwnProperty(status)) {
        orderByStatus[status] = item.count;
      }
    });

    return responseHandler(
      res,
      200,
      "Dashboard statistics fetched successfully",
      {
        counts: {
          orders: totalOrders,
          users: totalUsers,
          products: totalProducts,
          revenue: revenue.length > 0 ? revenue[0].total : 0,
        },
        orderByStatus,
        recentOrders,
        monthlySales,
      }
    );
  } catch (error) {
    console.log("Error get dashboard data", error);
    return next(createHttpError(500, "Internal server error"));
  }
};

export const getSellerPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId, status, paymentMethod, startDate, endDate } = req.query;
    const query: any = {};

    if (sellerId && sellerId !== "all") {
      query.sellerId = sellerId;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (paymentMethod && paymentMethod !== "all") {
      query.paymentMethod = paymentMethod;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const payments = await SellerPayment.find(query)
      .populate("seller", "name email phoneNumber paymentMode paymentDetails")
      .populate("order")
      .populate("product", "subject finalPrice images")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 });

    return responseHandler(
      res,
      200,
      "Seller payment fetched successfully",
      payments
    );
  } catch (error) {
    console.log("Error fetching seller payment", error);
    return next(createHttpError(500, "Internal server error"));
  }
};
