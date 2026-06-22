import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const dbConnectionString =
      process.env.NODE_ENV === "production"
        ? process.env.MONGO_URI
        : process.env.MONGO_LOCAL_URI;
    const connectDB = await mongoose.connect(dbConnectionString as string);
    console.log(`MongoDB connected: ${connectDB.connection.host}`);
  } catch (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
};
