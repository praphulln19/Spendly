/**
 * Format a number as Indian Rupee currency (e.g. "₹1,250")
 */
export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
