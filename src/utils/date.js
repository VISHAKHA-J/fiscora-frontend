const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-10-20" -> "20 Oct 2026". Parsed by hand so time zones can't shift the day.
export function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// Today in the user's own time zone, as "YYYY-MM-DD" (what <input type="date"> uses).
export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Months are "YYYY-MM" strings. "2026-10" -> "October 2026"
export function formatMonth(month) {
  const [year, number] = month.split('-').map(Number);
  return `${MONTH_NAMES[number - 1]} ${year}`;
}

// shiftMonth("2026-01", -1) -> "2025-12"
export function shiftMonth(month, delta) {
  const [year, number] = month.split('-').map(Number);
  const index = year * 12 + (number - 1) + delta;
  const nextYear = Math.floor(index / 12);
  const nextMonth = String((index % 12) + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

export const currentMonth = () => todayISO().slice(0, 7);