import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role = req.role;

    if (role !== "admin") {
      return next(createHttpError(403, "Forbidded, Admin access is required"));
    }
    next();
  } catch (error) {
    return next(createHttpError(500, "Internal server error"));
  }
};
