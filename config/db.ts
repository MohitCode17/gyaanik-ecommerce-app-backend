import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      process.env.MONGO_DB_URL as string
    );
    console.log(`Mongodb connection success: ${connection.connection.host}`);
  } catch (error) {
    console.log(`Mongodb connection failed with error: ${error}`);
    process.exit(1);
  }
};
