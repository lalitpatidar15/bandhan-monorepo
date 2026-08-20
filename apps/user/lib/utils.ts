// lib/utils.ts

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString()}`;
}

export function calculatePercentage(used: number, total: number): number {
  return Math.round((used / total) * 100);
}