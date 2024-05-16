import mongoose, { ConnectOptions } from "mongoose";
import removeExpiredTokens from "../utils/removeExpiredResetTokens";

async function connectToDB() {
  try {
    const connection = await mongoose.connect(process.env.DB_URI || "");

    console.log(`Connected to db: ${connection.connection.host}`);

    // Remove expired password reset tokens
    console.log("Removing expired password reset tokens...");
    await removeExpiredTokens();
    console.log("Successfully removed expired reset tokens");
  } catch (err: any) {
    console.log(err);
    process.exit(1);
  }
}

export default connectToDB;
