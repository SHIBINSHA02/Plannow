import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(uri as string);
  console.log("Connected");
  const doc = await mongoose.connection.collection("onboardingtokens").findOne({ tokenId: "ed8aecb0-f309-407d-a58f-f36b97634135" });
  console.log(doc);
  process.exit();
}
check();
