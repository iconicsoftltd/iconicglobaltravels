// utils/amountFormatter.ts

/**
 * Safely convert any value to number
 */
export const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Format number with fixed decimals
 * Example: 1000 -> 1000.00
 */
export const toFixedAmount = (value: any, digits = 2): string => {
  return toNumber(value).toFixed(digits);
};

/**
 * Format number with comma separators
 * Example: 1000000 -> 1,000,000
 */
export const formatNumber = (
  value: any,
  options?: Intl.NumberFormatOptions,
): string => {
  return toNumber(value).toLocaleString(undefined, options);
};

/**
 * Format amount with decimals + commas
 * Example: 1000000 -> 1,000,000.00
 */
export const formatAmount = (value: any, digits = 2): string => {
  return toNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

/**
 * Format currency with symbol
 * Example: ৳ 1,000.00
 */
export const formatCurrency = (
  value: any,
  symbol = "৳",
  digits = 2,
): string => {
  return `${symbol} ${formatAmount(value, digits)}`;
};

/**
 * Compact format (K, M, B)
 * Example: 1200 -> 1.2K
 */
export const formatCompact = (value: any): string => {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
};

/**
 * Remove decimals (integer format)
 */
export const formatInteger = (value: any): string => {
  return Math.floor(toNumber(value)).toLocaleString();
};

/**
 * Percentage formatter
 * Example: 0.25 -> 25%
 */
export const formatPercentage = (value: any, digits = 2): string => {
  return `${(toNumber(value) * 100).toFixed(digits)}%`;
};
