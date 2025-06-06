/**
 * Formatting utilities for numbers, time, and other display values
 * Extracted for better tree-shaking and reusability
 */

import { formatNumber, formatTime, formatEfficiency } from './big';

// Re-export BigInt formatters for convenience
export { formatNumber, formatTime, formatEfficiency };

/**
 * Format a resource amount with its icon
 * @param amount - Resource amount
 * @param icon - Resource icon
 * @param name - Resource name (optional)
 * @returns Formatted string with icon
 */
export const formatResource = (amount: bigint, icon: string, name?: string): string => {
  const formattedAmount = formatNumber(amount);
  return name ? `${icon} ${formattedAmount} ${name}` : `${icon} ${formattedAmount}`;
};

/**
 * Format a production rate per second
 * @param rate - Rate per second
 * @param icon - Resource icon
 * @returns Formatted rate string
 */
export const formatRate = (rate: bigint, icon?: string): string => {
  const sign = rate >= 0n ? '+' : '';
  const formatted = `${sign}${formatNumber(rate)}/s`;
  return icon ? `${icon} ${formatted}` : formatted;
};

/**
 * Format a cost object as a readable string
 * @param cost - Cost object with resource IDs and amounts
 * @param resourceData - Resource data for icons
 * @returns Formatted cost string
 */
export const formatCost = (
  cost: Record<string, number>, 
  resourceData: Record<string, { icon: string; name: string }>
): string => {
  return Object.entries(cost)
    .map(([resourceId, amount]) => {
      const resource = resourceData[resourceId];
      if (!resource) return `${amount} ${resourceId}`;
      return `${resource.icon} ${formatNumber(BigInt(amount))}`;
    })
    .join(', ');
};

/**
 * Format a building count with proper pluralization
 * @param count - Building count
 * @param singularName - Singular building name
 * @param pluralName - Plural building name (optional)
 * @returns Formatted building count string
 */
export const formatBuildingCount = (
  count: bigint, 
  singularName: string, 
  pluralName?: string
): string => {
  const formatted = formatNumber(count);
  if (count === 1n) return `${formatted} ${singularName}`;
  return `${formatted} ${pluralName || singularName + 's'}`;
};

/**
 * Format worker assignment status
 * @param assigned - Currently assigned workers
 * @param capacity - Maximum worker capacity
 * @param requirement - Optimal worker requirement (optional)
 * @returns Formatted worker status string
 */
export const formatWorkers = (
  assigned: bigint, 
  capacity: number, 
  requirement?: number
): string => {
  const assignedNum = formatNumber(assigned);
  const capacityStr = formatNumber(BigInt(capacity));
  
  if (requirement) {
    const reqStr = formatNumber(BigInt(requirement));
    return `👷 ${assignedNum}/${capacityStr} (建议: ${reqStr})`;
  }
  
  return `👷 ${assignedNum}/${capacityStr}`;
};

/**
 * Format a percentage with appropriate precision
 * @param value - Decimal value (0.0 to 1.0)
 * @param precision - Decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, precision: number = 1): string => {
  const percentage = (value * 100).toFixed(precision);
  return `${percentage}%`;
};

/**
 * Format a multiplier value
 * @param multiplier - Multiplier value
 * @returns Formatted multiplier string
 */
export const formatMultiplier = (multiplier: number): string => {
  if (multiplier === 1) return '×1.0';
  return `×${multiplier.toFixed(1)}`;
};

/**
 * Format an era name with icon
 * @param name - Era name
 * @param icon - Era icon
 * @returns Formatted era string
 */
export const formatEra = (name: string, icon: string): string => {
  return `${icon} ${name}`;
};

/**
 * Format achievement progress
 * @param current - Current progress
 * @param target - Target value
 * @param unit - Unit name (optional)
 * @returns Formatted progress string
 */
export const formatProgress = (
  current: bigint, 
  target: bigint, 
  unit?: string
): string => {
  const currentStr = formatNumber(current);
  const targetStr = formatNumber(target);
  const percentage = formatPercentage(Number(current) / Number(target));
  
  if (unit) {
    return `${currentStr}/${targetStr} ${unit} (${percentage})`;
  }
  
  return `${currentStr}/${targetStr} (${percentage})`;
};

/**
 * Format a large number with commas for readability
 * @param num - Number to format
 * @returns Formatted number string with commas
 */
export const formatWithCommas = (num: number | bigint): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format a decimal number with appropriate precision
 * @param num - Number to format
 * @param precision - Decimal places
 * @returns Formatted decimal string
 */
export const formatDecimal = (num: number, precision: number = 2): string => {
  return num.toFixed(precision);
};

/**
 * Format a scientific notation number
 * @param num - Number to format
 * @param precision - Decimal places
 * @returns Formatted scientific notation string
 */
export const formatScientific = (num: number, precision: number = 2): string => {
  return num.toExponential(precision);
};

/**
 * Format a compact number (similar to Intl.NumberFormat compact)
 * @param num - Number to format
 * @returns Compact formatted string
 */
export const formatCompact = (num: bigint): string => {
  // Use our existing formatNumber which already does compact formatting
  return formatNumber(num);
};

/**
 * Format a boolean as Yes/No or custom strings
 * @param value - Boolean value
 * @param trueText - Text for true (default: "Yes")
 * @param falseText - Text for false (default: "No")
 * @returns Formatted boolean string
 */
export const formatBoolean = (
  value: boolean, 
  trueText: string = 'Yes', 
  falseText: string = 'No'
): string => {
  return value ? trueText : falseText;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
