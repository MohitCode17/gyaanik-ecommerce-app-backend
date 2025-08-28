import jwt from "jsonwebtoken";
import { IUSER } from "../models/user-models";

export const generateToken = (user: IUSER) => {
  return jwt.sign(
    { userId: user?._id, role: user?.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    }
  );
};
