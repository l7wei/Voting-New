import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import path from 'path';

const VOTER_LIST_PATH = path.join(process.cwd(), 'data', 'voterList.csv');
const VOTER_LIST_BACKUP_PATH = path.join(process.cwd(), 'data', 'voterList.csv.backup');

let cachedVoterList: string[] | null = null;

export async function loadVoterList(): Promise<string[]> {
  if (cachedVoterList) {
    return cachedVoterList;
  }

  try {
    const csvContent = await fs.readFile(VOTER_LIST_PATH, 'utf-8');
    cachedVoterList = parseVoterList(csvContent);
    return cachedVoterList;
  } catch (error) {
    console.error('Failed to load voter list:', error);
    return [];
  }
}

export function parseVoterList(csvContent: string): string[] {
  try {
    const records = parse(csvContent, {
      skip_empty_lines: true,
      trim: true,
    });

    // Skip header row and extract student IDs from first column
    const studentIds = records.slice(1).map((record: string[]) => record[0]).filter(Boolean);
    return studentIds;
  } catch (error) {
    console.error('Failed to parse voter list:', error);
    return [];
  }
}

export async function saveVoterList(csvContent: string): Promise<void> {
  // Validate CSV format
  const studentIds = parseVoterList(csvContent);
  
  if (studentIds.length === 0) {
    throw new Error('Invalid CSV format or empty voter list');
  }

  // Validate student IDs (alphanumeric only)
  const invalidIds = studentIds.filter(id => !/^[A-Za-z0-9]+$/.test(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid student IDs found: ${invalidIds.join(', ')}`);
  }

  // Create data directory if it doesn't exist
  const dataDir = path.dirname(VOTER_LIST_PATH);
  await fs.mkdir(dataDir, { recursive: true });

  // Backup current list if it exists
  try {
    await fs.access(VOTER_LIST_PATH);
    await fs.copyFile(VOTER_LIST_PATH, VOTER_LIST_BACKUP_PATH);
  } catch {
    // No existing file to backup
  }

  // Save new list
  await fs.writeFile(VOTER_LIST_PATH, csvContent, 'utf-8');
  
  // Clear cache
  cachedVoterList = null;
}

export async function restoreVoterListBackup(): Promise<void> {
  try {
    await fs.access(VOTER_LIST_BACKUP_PATH);
    await fs.copyFile(VOTER_LIST_BACKUP_PATH, VOTER_LIST_PATH);
    
    // Clear cache
    cachedVoterList = null;
  } catch {
    throw new Error('No backup found to restore');
  }
}

export function isStudentEligible(studentId: string, voterList: string[]): boolean {
  return voterList.includes(studentId);
}

export function reloadVoterList(): void {
  cachedVoterList = null;
}
