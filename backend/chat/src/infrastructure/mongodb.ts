import mongoose from "mongoose";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (error) {
    console.error(
      `Error connecting to MongoDB with URI (${process.env.MONGO_URI!}): `,
      error,
    );
  }
};

export default connectToMongoDB;
