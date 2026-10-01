import { describe, it, expect } from 'vitest';
import {
  formatINR,
  formatNumber,
  slugify,
  escapeHtml,
  getBrandBg,
  isValidPhone,
  isValidEmail,
  safeNum,
  clamp,
  truncate,
  formatDate,
} from './utils';

describe('formatINR', () => {
  it('formats positive amount with currency symbol and commas', () => {
    const formatted = formatINR(125000.5);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('1,25,000.50');
  });

  it('handles 0 correctly', () => {
    expect(formatINR(0)).toBe('₹0.00');
  });
});

describe('formatNumber', () => {
  it('formats numbers in Indian comma system', () => {
    expect(formatNumber(100000)).toBe('1,00,000');
  });

  it('formats decimals correctly when specified', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
  });
});

describe('slugify', () => {
  it('converts complex names into clean url-friendly slugs', () => {
    expect(slugify('Silk Glamor High Sheen')).toBe('silk-glamor-high-sheen');
    expect(slugify('Berger Paints - Apex Ultima!')).toBe('berger-paints-apex-ultima');
  });
});

describe('escapeHtml', () => {
  it('escapes dangerous HTML characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });
});

describe('getBrandBg', () => {
  it('maps brands to their custom CSS class names', () => {
    expect(getBrandBg('Berger Paints')).toBe('brand-berger');
    expect(getBrandBg('Asian Paints')).toBe('brand-asian');
    expect(getBrandBg('Birla Opus')).toBe('brand-birla');
  });
});

describe('isValidPhone & isValidEmail', () => {
  it('validates 10-digit Indian phone numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('+91 9876543210')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
  });

  it('validates email addresses', () => {
    expect(isValidEmail('contractor@paintpro.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});

describe('safeNum and clamp', () => {
  it('safeNum parses strings or returns fallback', () => {
    expect(safeNum('45.5', 0)).toBe(45.5);
    expect(safeNum('abc', 10)).toBe(10);
  });

  it('clamp restricts values to min and max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

describe('truncate', () => {
  it('truncates strings longer than max length with ellipsis', () => {
    expect(truncate('Super luxury architectural finish', 12)).toBe('Super luxury…');
  });
});
