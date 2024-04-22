import bcrypt from "bcryptjs";

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export default hashPassword;
