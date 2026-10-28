const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// 30050.5 -> "₹30,050.50"
export const formatMoney = (amount) => formatter.format(Number(amount) || 0);