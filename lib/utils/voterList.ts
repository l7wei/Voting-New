import fs from 'fs';
import path from 'path';

const VOTER_LIST_PATH = path.join(process.cwd(), 'data', 'voterList.csv');
const VOTER_LIST_BACKUP_PATH = path.join(process.cwd(), 'data', 'voterList.csv.backup');

let cachedVoterList: Set<string> | null = null;

/**
 * Load voter list from CSV file
 * Returns a Set of eligible student IDs
 */
export function loadVoterList(): Set<string> {
  if (cachedVoterList) {
    return cachedVoterList;
  }

  try {
    const fileContent = fs.readFileSync(VOTER_LIST_PATH, 'utf8');
    const lines = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line);
    
    // Skip header row if it exists
    const studentIds = lines[0] === 'student_id' ? lines.slice(1) : lines;
    
    cachedVoterList = new Set(studentIds);
    return cachedVoterList;
  } catch (error) {
    console.error('Failed to load voter list:', error);
    return new Set();
  }
}

/**
 * Reload voter list from disk (call after upload)
 */
export function reloadVoterList(): void {
  cachedVoterList = null;
  loadVoterList();
}

/**
 * Check if a student ID is eligible to vote
 */
export function isEligibleVoter(studentId: string): boolean {
  const voterList = loadVoterList();
  return voterList.has(studentId);
}

/**
 * Validate CSV format
 */
export function validateVoterCSV(content: string): boolean {
  const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line);
  
  if (lines.length === 0) {
    return false;
  }

  // Check if all lines contain only alphanumeric characters
  return lines.every(line => /^[A-Za-z0-9]+$/.test(line));
}

/**
 * Save voter list CSV
 */
export function saveVoterList(content: string): void {
  // Backup existing file if it exists
  if (fs.existsSync(VOTER_LIST_PATH)) {
    fs.copyFileSync(VOTER_LIST_PATH, VOTER_LIST_BACKUP_PATH);
  }

  // Save new file
  fs.writeFileSync(VOTER_LIST_PATH, content, 'utf8');
  
  // Reload cache
  reloadVoterList();
}

/**
 * Restore from backup
 */
export function restoreVoterListBackup(): boolean {
  if (!fs.existsSync(VOTER_LIST_BACKUP_PATH)) {
    return false;
  }

  fs.copyFileSync(VOTER_LIST_BACKUP_PATH, VOTER_LIST_PATH);
  reloadVoterList();
  return true;
}

/**
 * Get voter list statistics
 */
export function getVoterListStats(): { total: number; hasBackup: boolean } {
  const voterList = loadVoterList();
  const hasBackup = fs.existsSync(VOTER_LIST_BACKUP_PATH);
  
  return {
    total: voterList.size,
    hasBackup,
  };
}
