import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { HttpError } from "http-errors";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = (err as HttpError).status || 500;

  res.status(statusCode).json({
    message: err.message,
    errorStack: process.env.NODE_ENV === "development" ? err.stack : "",
  });
};

export default globalErrorHandler;
