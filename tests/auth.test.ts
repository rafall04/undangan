import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing (scrypt)', () => {
  it('verifies the correct password', () => {
    const stored = hashPassword('rahasia-kuat-123');
    expect(verifyPassword('rahasia-kuat-123', stored)).toBe(true);
  });

  it('rejects the wrong password', () => {
    const stored = hashPassword('rahasia-kuat-123');
    expect(verifyPassword('salah', stored)).toBe(false);
  });

  it('produces a unique salt per hash (same password → different stored value)', () => {
    expect(hashPassword('sama')).not.toBe(hashPassword('sama'));
  });

  it('rejects malformed stored values', () => {
    expect(verifyPassword('x', '')).toBe(false);
    expect(verifyPassword('x', 'no-colon')).toBe(false);
    expect(verifyPassword('x', 'deadbeef:')).toBe(false);
  });

  it('stored format is salt:hash hex', () => {
    const stored = hashPassword('abc');
    expect(stored).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });
});
