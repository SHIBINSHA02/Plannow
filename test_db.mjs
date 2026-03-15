import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => mongoose.connection.collection("onboardingtokens").findOne({ tokenId: "ed8aecb0-f309-407d-a58f-f36b97634135" }))
  .then((doc) => { console.log("DOC:", doc); process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
