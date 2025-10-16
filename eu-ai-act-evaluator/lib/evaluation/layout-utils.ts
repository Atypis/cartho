/**
 * Layout Utilities for Tabular Requirements View
 *
 * Provides numbering system and parent chain logic
 */

/**
 * Convert index to Roman numeral (for root level)
 */
export function toRomanNumeral(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

/**
 * Convert index to letter or number based on depth
 * Depth 0: I, II, III (Roman numerals)
 * Depth 1: A, B, C (uppercase letters)
 * Depth 2: 1, 2, 3 (numbers)
 * Depth 3: a, b, c (lowercase letters)
 * Depth 4+: numbers
 */
export function toNumbering(index: number, depth: number): string {
  if (depth === 0) {
    return toRomanNumeral(index + 1);
  }
  if (depth === 1) {
    return String.fromCharCode(65 + index); // A, B, C...
  }
  if (depth === 2) {
    return (index + 1).toString(); // 1, 2, 3...
  }
  if (depth === 3) {
    return String.fromCharCode(97 + index); // a, b, c...
  }
  return (index + 1).toString(); // fallback to numbers
}

/**
 * Build full numbering string (e.g., "I.A.1.a")
 */
export function buildNumberString(indices: number[]): string {
  return indices.map((idx, depth) => toNumbering(idx, depth)).join('.');
}
