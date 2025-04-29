import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Address from "../models/address-models";
import { responseHandler } from "../utils/responseHandler";
import User from "../models/user-models";

export const createOrUpdateAddressByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;

    const {
      addressLine1,
      addressLine2,
      phoneNumber,
      city,
      state,
      pincode,
      addressId,
    } = req.body;

    if (!userId) {
      return next(createHttpError(400, "Please provide a valid id"));
    }

    if (!addressLine1 || !phoneNumber || !city || !state || !pincode) {
      return next(createHttpError(400, "All fields are required"));
    }

    if (addressId) {
      const exisitingAddress = await Address.findById(addressId);

      if (!exisitingAddress) {
        return next(createHttpError(400, "Address not found"));
      }

      exisitingAddress.addressLine1 = addressLine1;
      exisitingAddress.addressLine2 = addressLine2;
      exisitingAddress.phoneNumber = phoneNumber;
      exisitingAddress.city = city;
      exisitingAddress.state = state;
      exisitingAddress.pincode = pincode;

      await exisitingAddress.save();

      return responseHandler(
        res,
        200,
        "Address updated successfully",
        exisitingAddress
      );
    }

    const newAddress = new Address({
      user: userId,
      addressLine1,
      addressLine2,
      phoneNumber,
      city,
      state,
      pincode,
      addressId,
    });

    await newAddress.save();
    await User.findByIdAndUpdate(
      userId,
      { $push: { address: newAddress._id } },
      { new: true }
    );

    return responseHandler(
      res,
      200,
      "Address created successfully",
      newAddress
    );
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const getAddressByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;

    if (!userId) {
      return next(createHttpError(400, "Please provide a valid id"));
    }

    const address = await User.findById(userId).populate("address");

    if (!address) {
      return next(createHttpError(404, "User Address not found"));
    }

    return responseHandler(res, 200, "User address get successful", address);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
