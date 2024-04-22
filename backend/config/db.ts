import mongoose, { ConnectOptions } from "mongoose";

async function connectToDB() {
  try {
    const connection = await mongoose.connect(process.env.DB_URI || "");

    console.log(`Connected to db: ${connection.connection.host}`);
  } catch (err: any) {
    console.log(err);
    process.exit(1);
  }
}

export default connectToDB;
