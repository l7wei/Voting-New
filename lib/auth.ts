export { generateToken, verifyToken } from "@/lib/jwt";
import { isAdmin as checkIsAdmin } from "@/lib/adminConfig";

export async function isAdmin(studentId: string): Promise<boolean> {
  return checkIsAdmin(studentId);
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}
