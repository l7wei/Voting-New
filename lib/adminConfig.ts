import { readFileSync } from 'fs';
import { join } from 'path';

interface AdminConfig {
  admins: string[];
}

let adminConfig: AdminConfig | null = null;

export function loadAdminConfig(): AdminConfig {
  if (!adminConfig) {
    const configPath = join(process.cwd(), 'config', 'admins.json');
    const configData = readFileSync(configPath, 'utf-8');
    adminConfig = JSON.parse(configData);
  }
  return adminConfig as AdminConfig;
}

export function isAdmin(studentId: string): boolean {
  const config = loadAdminConfig();
  return config.admins.includes(studentId);
}

export function getAdminList(): string[] {
  const config = loadAdminConfig();
  return [...config.admins];
}
