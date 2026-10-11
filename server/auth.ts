import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const AUTH_FILE = path.resolve(process.cwd(), 'data', 'admin-auth.json');
export const PRIMARY_ADMIN_EMAIL = 'husnaincreator6@gmail.com';
export const PRIMARY_ADMIN_PASS = 'Mahar131@#';

interface StoredAuth {
  email: string;
  salt: string;
  hash: string;
  setupToken?: string;
  updatedAt: string;
}

interface ActiveSession {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory active admin sessions
const activeSessions = new Map<string, ActiveSession>();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function syncStoredCredentials(email: string, pass: string): StoredAuth {
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(pass, salt);
  const setupToken = crypto.randomBytes(24).toString('hex');

  const authData: StoredAuth = {
    email: email.trim().toLowerCase(),
    salt,
    hash,
    setupToken,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write admin-auth.json:', err);
  }

  return authData;
}

function initAdminAuth(): StoredAuth {
  return syncStoredCredentials(PRIMARY_ADMIN_EMAIL, PRIMARY_ADMIN_PASS);
}

let storedAuth = initAdminAuth();

export function verifyAdminPassword(email: string, passAttempt: string): boolean {
  if (!email || !passAttempt) return false;
  const normEmail = email.trim().toLowerCase();
  const rawPass = passAttempt;
  const cleanPass = passAttempt.trim();

  // 1. First priority: Check directly against primary configured credentials
  if (normEmail === 'husnaincreator6@gmail.com' || normEmail === PRIMARY_ADMIN_EMAIL) {
    if (rawPass === 'Mahar131@#' || cleanPass === 'Mahar131@#' || rawPass === PRIMARY_ADMIN_PASS || cleanPass === PRIMARY_ADMIN_PASS) {
      return true;
    }
  }

  // 2. Check against stored salted PBKDF2 hash
  if (fs.existsSync(AUTH_FILE)) {
    try {
      storedAuth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    } catch (e) {}
  }

  if (normEmail === storedAuth.email.toLowerCase()) {
    try {
      const calculatedRaw = hashPassword(rawPass, storedAuth.salt);
      if (crypto.timingSafeEqual(Buffer.from(calculatedRaw), Buffer.from(storedAuth.hash))) {
        return true;
      }

      const calculatedClean = hashPassword(cleanPass, storedAuth.salt);
      if (crypto.timingSafeEqual(Buffer.from(calculatedClean), Buffer.from(storedAuth.hash))) {
        return true;
      }
    } catch (err) {
      console.error('Hash comparison error:', err);
    }
  }

  return false;
}

export function updateAdminPassword(newPass: string): boolean {
  storedAuth = syncStoredCredentials(PRIMARY_ADMIN_EMAIL, newPass);
  return true;
}

export function createAdminSession(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: ActiveSession = {
    token,
    email: email.trim().toLowerCase(),
    createdAt: now,
    expiresAt: now + (24 * 60 * 60 * 1000) // 24 hours
  };
  activeSessions.set(token, session);
  return token;
}

export function validateAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

export function destroyAdminSession(token: string | undefined): void {
  if (token) {
    activeSessions.delete(token);
  }
}

export function getAdminEmail(): string {
  return PRIMARY_ADMIN_EMAIL;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] as string | undefined;
  
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (!token || !validateAdminSession(token)) {
    res.status(401).json({ 
      success: false, 
      error: 'Unauthorized: Valid administrator authentication required.' 
    });
    return;
  }

  next();
}
