/**
 * Utilities for formatting and parsing Indonesian Rupiah (IDR).
 * Optimized for monospace font rendering with tabular numerals.
 */

export function formatIDR(amount: number, showSign = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  if (isNegative) {
    return `- ${formatted}`;
  }

  if (showSign && amount > 0) {
    return `+ ${formatted}`;
  }

  return formatted;
}

export function formatIDRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1000000) {
    const val = (abs / 1000000).toFixed(1).replace('.0', '');
    return `${sign}Rp ${val} jt`;
  }
  if (abs >= 1000) {
    const val = (abs / 1000).toFixed(0);
    return `${sign}Rp ${val} rb`;
  }
  return formatIDR(amount);
}

export function parseRawNumber(value: string | number): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  const cleaned = value.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
