import { generateToken, verifyToken } from '@/lib/auth';

describe('Auth Library', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    student_id: '108060001',
    remark: 'admin',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.student_id).toBe(mockUser.student_id);
      expect(decoded?._id).toBe(mockUser._id);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      const oldToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHVkZW50X2lkIjoiMTA4MDYwMDAxIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid';
      const decoded = verifyToken(oldToken);
      expect(decoded).toBeNull();
    });
  });
});
