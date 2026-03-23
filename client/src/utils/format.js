export function formatDate(date) {
  return new Date(date).toLocaleString();
}

export function formatNumber(num) {
  return new Intl.NumberFormat().format(num || 0);
}

export function percentage(value) {
  return `${Math.round((value || 0) * 100)}%`;
}
