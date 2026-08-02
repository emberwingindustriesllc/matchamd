import { describe, it, expect } from 'vitest';
import { sanitizeDisplayName } from '@/lib/utils';

describe('sanitizeDisplayName', () => {
  it('cleans up duplicate glitched prefixes', () => {
    expect(sanitizeDisplayName('IMG DIMG DJohnoctoroctor')).toBe('Dr. John Doctor');
    expect(sanitizeDisplayName('Dr. Dr. John Smith')).toBe('Dr. John Smith');
    expect(sanitizeDisplayName('IMG Doctor Sarah Jenkins')).toBe('Dr. Sarah Jenkins');
  });

  it('handles clean names without alteration', () => {
    expect(sanitizeDisplayName('Dr. Sarah Chen')).toBe('Dr. Sarah Chen');
    expect(sanitizeDisplayName('John Smith')).toBe('John Smith');
  });

  it('handles empty or non-string inputs safely', () => {
    expect(sanitizeDisplayName('')).toBe('');
    expect(sanitizeDisplayName(null)).toBe('');
    expect(sanitizeDisplayName(undefined)).toBe('');
  });
});
