import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initGridFS } from '../config/gridfs';
import { User } from '../models/User';
import { TemporaryAccountService } from '../services/temporary-account.service';

dotenv.config();

const SALT_ROUNDS = 12;

export interface AccountInput {
  email: string;
  fullName?: string;
  password?: string;
  passwordEnv?: string;
  role?: 'user' | 'admin';
  accountType?: 'standard' | 'temporary';
}

interface AccountFile {
  accounts: AccountInput[];
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function fallbackFullName(email: string): string {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function validateAccounts(input: AccountInput[]): AccountInput[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error('Account file must contain a non-empty accounts array');
  }

  const seen = new Set<string>();
  return input.map((account, index) => {
    const email = normalizeEmail(account.email || '');
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error(`Account ${index + 1} has an invalid email address`);
    }
    if (seen.has(email)) {
      throw new Error(`Duplicate account email: ${email}`);
    }
    seen.add(email);

    const password = account.password ?? (account.passwordEnv ? process.env[account.passwordEnv] : undefined);
    if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw new Error(`Password for ${email} must be at least 8 characters and contain letters and numbers`);
    }

    const fullName = account.fullName?.trim() || fallbackFullName(email);
    if (fullName.length < 2 || fullName.length > 100) {
      throw new Error(`Full name for ${email} must be between 2 and 100 characters`);
    }

    return {
      email,
      fullName,
      password,
      role: account.role ?? 'user',
      accountType: account.accountType ?? 'standard',
    };
  });
}

export async function provisionAccounts(accounts: AccountInput[]): Promise<void> {
  const validated = validateAccounts(accounts);

  for (const account of validated) {
    const existing = await User.exists({ email: account.email });
    const passwordHash = await bcrypt.hash(account.password!, SALT_ROUNDS);

    const user = await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          email: account.email,
          passwordHash,
          fullName: account.fullName,
          role: account.role,
          accountType: account.accountType,
          isActive: true,
          verifiedEmail: true,
        },
        $setOnInsert: {
          totalRecordings: 0,
          totalPracticeTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          assessmentCompleted: false,
          sessionVersion: 0,
          resetInProgress: false,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).select('+sessionVersion +resetInProgress');

    if (!user) {
      throw new Error(`Failed to provision ${account.email}`);
    }

    if (user.accountType === 'temporary') {
      await TemporaryAccountService.reset(user._id);
    }

    console.log(`${existing ? 'updated' : 'created'}: ${account.email}`);
  }

  console.log(`Provisioned ${validated.length} accounts without logging passwords.`);
}

async function main(): Promise<void> {
  const accountFilePath = process.argv[2];
  if (!accountFilePath) {
    throw new Error('Usage: npm run accounts:provision -- <accounts.json>');
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  const absolutePath = path.resolve(accountFilePath);
  const parsed = JSON.parse(await fs.readFile(absolutePath, 'utf8')) as AccountFile | AccountInput[];
  const accounts = Array.isArray(parsed) ? parsed : parsed.accounts;

  await mongoose.connect(mongoUri);
  initGridFS();

  try {
    await provisionAccounts(accounts);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
