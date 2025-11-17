import { parseVoterList, isStudentEligible } from '@/lib/voterList';

describe('Voter List Library', () => {
  describe('parseVoterList', () => {
    it('should parse valid CSV content', () => {
      const csvContent = 'Student ID\n108060001\n108060002\n108060003';
      const result = parseVoterList(csvContent);
      
      expect(result).toHaveLength(3);
      expect(result).toContain('108060001');
      expect(result).toContain('108060002');
      expect(result).toContain('108060003');
    });

    it('should handle empty lines', () => {
      const csvContent = 'Student ID\n108060001\n\n108060002\n';
      const result = parseVoterList(csvContent);
      
      expect(result).toHaveLength(2);
      expect(result).toContain('108060001');
      expect(result).toContain('108060002');
    });

    it('should return empty array for invalid CSV', () => {
      const csvContent = '';
      const result = parseVoterList(csvContent);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('isStudentEligible', () => {
    const voterList = ['108060001', '108060002', '108060003'];

    it('should return true for eligible student', () => {
      expect(isStudentEligible('108060001', voterList)).toBe(true);
      expect(isStudentEligible('108060002', voterList)).toBe(true);
    });

    it('should return false for non-eligible student', () => {
      expect(isStudentEligible('108060999', voterList)).toBe(false);
      expect(isStudentEligible('999999999', voterList)).toBe(false);
    });
  });
});
