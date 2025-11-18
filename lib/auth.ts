import jwt from 'jsonwebtoken';
import { JWTPayload, AuthUser } from '@/types';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'mysecret';

export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    account: user.student_id,
    _id: user._id,
    student_id: user.student_id,
    remark: user.remark,
  };

  const options: jwt.SignOptions = {
    algorithm: 'HS256',
    expiresIn: '1d',
  };

  return jwt.sign(payload, TOKEN_SECRET, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, TOKEN_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

