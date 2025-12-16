import { DEFAULT_VALUE } from "./constants";

/**
 * Format a number with loading state support
 */
export const formatValue = (value: number, isLoading: boolean, decimals: number = 2): string => {
  if (isLoading) return DEFAULT_VALUE;
  return value.toFixed(decimals);
};

/**
 * Format an integer with loading state support
 */
export const formatInteger = (value: number, isLoading: boolean): string => {
  if (isLoading) return DEFAULT_VALUE;
  return value.toString();
};

/**
 * Format a percentage with loading state support
 */
export const formatPercentage = (value: number, isLoading: boolean): string => {
  if (isLoading) return DEFAULT_VALUE;
  return `${value}%`;
};
