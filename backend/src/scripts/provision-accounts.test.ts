import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { TemporaryAccountService } from '../services/temporary-account.service';
import { provisionAccounts, validateAccounts, type AccountInput } from './provision-accounts';

jest.mock('../models/User');
jest.mock('../services/temporary-account.service');

const accountFile = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../accounts.example.json'), 'utf8')
) as { accounts: AccountInput[] };

describe('account provisioning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const account of accountFile.accounts) {
      if (account.passwordEnv) process.env[account.passwordEnv] = 'SafePassword123#';
    }
  });

  it('defines the 15 requested unique accounts with guest/admin metadata', () => {
    const validated = validateAccounts(accountFile.accounts);
    const emails = validated.map((account) => account.email);

    expect(validated).toHaveLength(15);
    expect(new Set(emails).size).toBe(15);
    expect(validated.find((account) => account.email === 'guest@goodviet.glkh.vn')).toEqual(
      expect.objectContaining({ role: 'user', accountType: 'temporary' })
    );
    expect(validated.find((account) => account.email === 'admin@goodviet.glkh.vn')).toEqual(
      expect.objectContaining({ role: 'admin', accountType: 'standard' })
    );
  });

  it('rejects duplicate emails and missing passwords', () => {
    expect(() => validateAccounts([
      { email: 'same@example.com', password: 'Password123' },
      { email: 'SAME@example.com', password: 'Password456' },
    ])).toThrow('Duplicate account email');

    expect(() => validateAccounts([
      { email: 'missing@example.com' },
    ])).toThrow('Password for missing@example.com');
  });

  it('hashes passwords, upserts idempotently, and resets only the guest account', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (User.exists as jest.Mock).mockResolvedValue(null);
    (User.findOneAndUpdate as jest.Mock).mockImplementation((_filter, update) => ({
      select: jest.fn().mockResolvedValue({
        _id: update.$set.email,
        accountType: update.$set.accountType,
      }),
    }));
    (TemporaryAccountService.reset as jest.Mock).mockResolvedValue({});

    await provisionAccounts(accountFile.accounts);

    expect(bcrypt.hash).toHaveBeenCalledTimes(15);
    expect(bcrypt.hash).toHaveBeenCalledWith('SafePassword123#', 12);
    expect(User.findOneAndUpdate).toHaveBeenCalledTimes(15);
    expect(TemporaryAccountService.reset).toHaveBeenCalledTimes(1);

    for (const call of (User.findOneAndUpdate as jest.Mock).mock.calls) {
      const update = call[1];
      expect(update.$set.password).toBeUndefined();
      expect(update.$set.passwordHash).toBe('hashed-password');
    }

    const output = logSpy.mock.calls.flat().join(' ');
    expect(output).not.toContain('SafePassword123#');
    expect(output).not.toContain('hashed-password');
    logSpy.mockRestore();
  });
});
