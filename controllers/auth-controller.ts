import { NextFunction, Request, Response } from "express";
import User from "../models/user-models";
import createHttpError from "http-errors";
import crypto from "crypto";
import { responseHandler } from "../utils/responseHandler";
import { sendVerificationEmail } from "../config/emailConfig";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, agreeTerms } = req.body;

    // VALIDATIONS
    if (!name || !email || !password || agreeTerms === undefined) {
      return next(createHttpError(400, "All fields are required"));
    }

    if (!agreeTerms) {
      return next(
        createHttpError(400, "You must agree to the terms and conditions")
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(createHttpError(400, "User already exists"));
    }

    // CREATE A VERIFICATION TOKEN
    const verificationToken = crypto.randomBytes(20).toString("hex");

    // CREATE A NEW USER
    const user = new User({
      name,
      email,
      password,
      agreeTerms,
      verificationToken,
    });

    await user.save();

    // SEND VERIFICATION EMAIL
    const result = await sendVerificationEmail(user.email, verificationToken);
    console.log("Result", result);

    // RESPONSE HANDLER
    return responseHandler(
      res,
      200,
      "User register successfully, Please check your mail inbox to verify your account."
    );
  } catch (error) {
    // LOG THE ERROR TO THE CONSOLE FOR DEBUGGING
    console.error("Error during registration:", error);

    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
