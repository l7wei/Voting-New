import { SignJWT, jwtVerify } from "jose";
import { JWTPayload, AuthUser } from "@/types";
import { isAdmin as checkIsAdmin } from "@/lib/adminConfig";

if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET environment variable is required but not set");
}

const TOKEN_SECRET = process.env.TOKEN_SECRET;
const secret = new TextEncoder().encode(TOKEN_SECRET);

export async function generateToken(user: AuthUser): Promise<string> {
  // _id is set to student_id since we don't use MongoDB User collection
  const payload = {
    account: user.student_id,
    _id: user.student_id, // Use student_id as _id (no User collection)
    student_id: user.student_id,
    name: user.name,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    // Validate the payload has required fields
    if (
      payload &&
      typeof payload === "object" &&
      "student_id" in payload &&
      typeof payload.student_id === "string"
    ) {
      return payload as unknown as JWTPayload;
    }
    return null;
  } catch {
    return null;
  }
}

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
