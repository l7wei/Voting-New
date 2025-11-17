import jwt from 'jsonwebtoken';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'mysecret';

export interface JWTPayload {
  student_id: string;
  _id: string;
  remark?: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, TOKEN_SECRET) as JWTPayload;
}

export function isAdmin(remark?: string): boolean {
  return remark === 'admin';
}
