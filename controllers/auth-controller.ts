import { NextFunction, Request, Response } from "express";
import User from "../models/user-models";
import createHttpError from "http-errors";
import crypto from "crypto";
import { responseHandler } from "../utils/responseHandler";
import {
  sendResetPasswordLinkToEmail,
  sendVerificationEmail,
} from "../config/emailConfig";
import { generateToken } from "../utils/generateToken";

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

    // RESPONSE HANDLER
    return responseHandler(
      res,
      201,
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

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.params;

    let user = await User.findOne({ verificationToken: token });

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    // ISSUE ACCESS TOKEN
    const accessToken = generateToken(user);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    await user.save();

    return responseHandler(res, 200, "Email verified succesfully");
  } catch (error) {
    // LOG THE ERROR TO THE CONSOLE FOR DEBUGGING
    console.error("Error during verify email:", error);

    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // VALIDATIONS
    if (!email || !password) {
      return next(createHttpError(400, "All fields are required"));
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return next(createHttpError(400, "Invalid email or password"));
    }

    if (!user.isVerified) {
      return next(
        createHttpError(
          400,
          "Please verify your email before login. Check you email inbox to verify"
        )
      );
    }

    // ISSUE ACCESS TOKEN
    const accessToken = generateToken(user);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    // RESPONSE HANDLER
    return responseHandler(res, 200, "User login successfully.", {
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    // LOG THE ERROR TO THE CONSOLE FOR DEBUGGING
    console.error("Error during login:", error);

    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createHttpError(400, "Email is required!"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(createHttpError(400, "No account found with this email!"));
    }

    // CREATE A RESET PASSWORD TOKEN
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 HOUR PASSWORD EXPIRATION DURATION

    await user.save();

    await sendResetPasswordLinkToEmail(user.email, resetPasswordToken);

    return responseHandler(
      res,
      200,
      "A password reset link has been sent to your email."
    );
  } catch (error) {
    // LOG THE ERROR TO THE CONSOLE FOR DEBUGGING
    console.error("Error during sending reset password link:", error);

    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.params;
    const { newPassword } = req.body;

    let user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        createHttpError(400, "Invalid or expired reset password token")
      );
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return responseHandler(
      res,
      200,
      "Your password reset succesfully. You can now login with your new credentials"
    );
  } catch (error) {
    // LOG THE ERROR TO THE CONSOLE FOR DEBUGGING
    console.error("Error during reset password:", error);

    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("access_token", { httpOnly: true });

    return responseHandler(res, 200, "User logout successfully.");
  } catch (error) {
    // LOG THE ERROR TO THE CONSOLE FOR DEBUGGING
    console.error("Error during logout:", error);

    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};

export const checkUserAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.id;

    if (!userId) {
      return next(createHttpError(401, "Unauthorized please login to access!"));
    }

    const user = await User.findById(userId).select(
      "-password -verificationToken -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }

    return responseHandler(res, 200, "User fetch successfully", user);
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      return next(error);
    }
    return next(createHttpError(500, "Internal server error"));
  }
};
