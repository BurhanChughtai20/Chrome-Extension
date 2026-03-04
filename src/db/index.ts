import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected via Mongoose");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function closeMongo() {
  await mongoose.connection.close();
}