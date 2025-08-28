import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      id: string;
      role: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(
      createHttpError(401, "User not authenticated, or no token available")
    );
  }

  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;

    if (!decode) {
      return next(createHttpError(401, "Not authorized, User not found"));
    }

    req.id = decode.userId;
    req.role = decode.role;
    next();
  } catch (error) {
    return next(
      createHttpError(401, "Not authorized, token is invalid or expired")
    );
  }
};
