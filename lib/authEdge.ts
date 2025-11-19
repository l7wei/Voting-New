// Edge-compatible JWT functions using jose library
import { SignJWT, jwtVerify } from "jose";
import { JWTPayload as CustomJWTPayload } from "@/types";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "mysecret";
const secret = new TextEncoder().encode(TOKEN_SECRET);

export async function verifyTokenEdge(
  token: string,
): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    // Jose's JWTPayload has different structure, we need to validate and convert
    if (payload && typeof payload === "object" && "student_id" in payload) {
      return payload as unknown as CustomJWTPayload;
    }
    return null;
  } catch (error) {
    console.error(
      "[verifyTokenEdge] Failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
}

export async function generateTokenEdge(user: {
  student_id: string;
  name: string;
  _id: string;
}): Promise<string> {
  const jwt = await new SignJWT({
    account: user.student_id,
    _id: user.student_id,
    student_id: user.student_id,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);

  return jwt;
}
