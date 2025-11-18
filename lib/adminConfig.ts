import fs from 'fs';
import path from 'path';

interface AdminConfig {
  admins: string[];
}

let adminConfig: AdminConfig | null = null;

export function loadAdminConfig(): AdminConfig {
  if (adminConfig) {
    return adminConfig;
  }

  try {
    const configPath = path.join(process.cwd(), 'config', 'admins.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    adminConfig = JSON.parse(configData);
    return adminConfig as AdminConfig;
  } catch (error) {
    console.error('Error loading admin config:', error);
    return { admins: [] };
  }
}

export function isAdmin(studentId: string): boolean {
  const config = loadAdminConfig();
  return config.admins.includes(studentId);
}

export function getAdmins(): string[] {
  const config = loadAdminConfig();
  return config.admins;
}
