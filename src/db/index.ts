import { MongoClient } from "mongodb";

let client: MongoClient;

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");

  client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function closeMongo() {
  if (client) await client.close();
}
