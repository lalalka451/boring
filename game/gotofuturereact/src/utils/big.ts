/**
 * BigInt utility functions for handling extremely large numbers
 * Extracted from gameStore for better tree-shaking and reusability
 */

/**
 * Format a BigInt number with appropriate suffixes (K, M, B, T, etc.)
 * @param num - The BigInt number to format
 * @returns Formatted string with suffix
 */
export const formatNumber = (num: bigint): string => {
  if (num < 1000n) {
    return num.toString();
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];
  let tier = 0;
  let value = Number(num);

  while (value >= 1000 && tier < suffixes.length - 1) {
    value /= 1000;
    tier++;
  }

  // Format to 2 decimal places for large numbers
  const formatted = tier === 0 ? value.toString() : value.toFixed(2);
  return formatted + suffixes[tier];
};

/**
 * Convert a number to BigInt safely
 * @param value - Number or string to convert
 * @returns BigInt value
 */
export const toBigInt = (value: number | string | bigint): bigint => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string') return BigInt(value);
  return BigInt(Math.floor(value));
};

/**
 * Add two BigInt values safely
 * @param a - First value
 * @param b - Second value
 * @returns Sum as BigInt
 */
export const addBig = (a: bigint, b: bigint): bigint => a + b;

/**
 * Subtract two BigInt values safely (minimum 0)
 * @param a - First value
 * @param b - Second value
 * @returns Difference as BigInt, minimum 0
 */
export const subtractBig = (a: bigint, b: bigint): bigint => {
  const result = a - b;
  return result < 0n ? 0n : result;
};

/**
 * Multiply BigInt by a number
 * @param big - BigInt value
 * @param multiplier - Number multiplier
 * @returns Product as BigInt
 */
export const multiplyBig = (big: bigint, multiplier: number): bigint => {
  return big * toBigInt(multiplier);
};

/**
 * Calculate percentage of a BigInt value
 * @param value - BigInt value
 * @param percentage - Percentage (0-100)
 * @returns Percentage of value as BigInt
 */
export const percentOfBig = (value: bigint, percentage: number): bigint => {
  return (value * toBigInt(percentage)) / 100n;
};

/**
 * Compare two BigInt values
 * @param a - First value
 * @param b - Second value
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
export const compareBig = (a: bigint, b: bigint): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

/**
 * Get minimum of two BigInt values
 * @param a - First value
 * @param b - Second value
 * @returns Minimum value
 */
export const minBig = (a: bigint, b: bigint): bigint => a < b ? a : b;

/**
 * Get maximum of two BigInt values
 * @param a - First value
 * @param b - Second value
 * @returns Maximum value
 */
export const maxBig = (a: bigint, b: bigint): bigint => a > b ? a : b;

/**
 * Clamp a BigInt value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clampBig = (value: bigint, min: bigint, max: bigint): bigint => {
  return maxBig(min, minBig(max, value));
};

/**
 * Calculate compound interest for BigInt values
 * @param principal - Initial amount
 * @param rate - Interest rate (as decimal, e.g., 0.05 for 5%)
 * @param time - Time periods
 * @returns Final amount after compound interest
 */
export const compoundInterestBig = (principal: bigint, rate: number, time: number): bigint => {
  const multiplier = Math.pow(1 + rate, time);
  return multiplyBig(principal, multiplier);
};

/**
 * Format time duration in seconds to human readable format
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
};

/**
 * Calculate efficiency percentage as a formatted string
 * @param current - Current value
 * @param maximum - Maximum possible value
 * @returns Formatted percentage string
 */
export const formatEfficiency = (current: number, maximum: number): string => {
  if (maximum === 0) return '0%';
  const percentage = Math.round((current / maximum) * 100);
  return `${percentage}%`;
};

/**
 * Parse a formatted number string back to BigInt
 * @param formatted - Formatted string (e.g., "1.5K")
 * @returns BigInt value
 */
export const parseFormattedNumber = (formatted: string): bigint => {
  const suffixMap: Record<string, number> = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000,
    'T': 1000000000000,
    'P': 1000000000000000,
    'E': 1000000000000000000
  };

  const match = formatted.match(/^([\d.]+)([KMBTPE]?)$/);
  if (!match) return toBigInt(formatted);

  const [, numberPart, suffix] = match;
  const baseValue = parseFloat(numberPart);
  const multiplier = suffixMap[suffix] || 1;

  return toBigInt(baseValue * multiplier);
};
