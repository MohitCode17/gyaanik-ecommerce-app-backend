import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import User from "../models/user-models";
import { responseHandler } from "../utils/responseHandler";

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(createHttpError(400, "User id is required"));
    }

    const { name, email, phoneNumber } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phoneNumber },
      { new: true, runValidators: true }
    ).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires"
    );

    if (!updateUser) {
      return next(createHttpError(400, "User not found"));
    }

    return responseHandler(
      res,
      200,
      "User profile updated successfully",
      updateUser
    );
  } catch (error) {}
};
