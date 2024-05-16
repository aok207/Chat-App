import ResetToken from "../models/resetTokenModel";

async function removeExpiredTokens() {
  await ResetToken.find({ expiresAt: { $lt: new Date() } }).deleteMany();
}

export default removeExpiredTokens;
