import { readFileSync } from 'fs';
import { join } from 'path';

interface AdminConfig {
  admins: string[];
}

let adminConfig: AdminConfig | null = null;

/**
 * Load admin configuration from JSON file
 */
function loadAdminConfig(): AdminConfig {
  if (adminConfig) {
    return adminConfig;
  }

  try {
    const configPath = join(process.cwd(), 'config', 'admins.json');
    const fileContent = readFileSync(configPath, 'utf-8');
    adminConfig = JSON.parse(fileContent);
    return adminConfig as AdminConfig;
  } catch (error) {
    console.error('Error loading admin config:', error);
    return { admins: [] };
  }
}

/**
 * Check if a student ID is an admin
 */
export function isAdmin(studentId: string): boolean {
  const config = loadAdminConfig();
  return config.admins.includes(studentId);
}

/**
 * Reload admin configuration (useful for testing or when config changes)
 */
export function reloadAdminConfig(): void {
  adminConfig = null;
}
