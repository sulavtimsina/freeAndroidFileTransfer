import { describe, it, expect } from 'vitest';

describe('Sample Test Suite', () => {
  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const appName = 'Android File Transfer';
    expect(appName).toContain('Android');
    expect(appName.toLowerCase()).toBe('android file transfer');
  });
});
