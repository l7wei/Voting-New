import jwt from 'jsonwebtoken';
import { JWTPayload, AuthUser } from '@/types';
import adminsConfig from '@/config/admins.json';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'mysecret';

export function generateToken(user: AuthUser): string {
  // _id is set to student_id since we don't use MongoDB User collection
  const payload: JWTPayload = {
    account: user.student_id,
    _id: user.student_id, // Use student_id as _id (no User collection)
    student_id: user.student_id,
    name: user.name,
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

export function isAdmin(studentId: string): boolean {
  return adminsConfig.admins.includes(studentId);
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}
