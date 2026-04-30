/**
 * Format a timestamp to a human-readable date string.
 */
export function formatDate(timestamp: number): string {
  if (!timestamp || timestamp <= 0) return '—';
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format a timestamp to a date+time string.
 */
export function formatDateTime(timestamp: number): string {
  if (!timestamp || timestamp <= 0) return '—';
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Extract year string from timestamp.
 */
export function getYear(timestamp: number): string {
  return new Date(timestamp).getFullYear().toString();
}

/**
 * Extract zero-padded month string from timestamp.
 */
export function getMonth(timestamp: number): string {
  return (new Date(timestamp).getMonth() + 1).toString().padStart(2, '0');
}

/**
 * Extract zero-padded day string from timestamp.
 */
export function getDay(timestamp: number): string {
  return new Date(timestamp).getDate().toString().padStart(2, '0');
}

/**
 * Get current timestamp in ms.
 */
export function now(): number {
  return Date.now();
}
