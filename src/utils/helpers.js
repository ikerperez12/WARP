export const toText = (value, fallback = '') => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() || fallback : fallback);
export const toId = (value) => toText(value).toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 80);

export function toSafeGithubUrl(value) {
  const fallback = 'https://github.com/ikerperez12';
  if (typeof value !== 'string') return fallback;
  try {
    const url = value.trim();
    if (!/^https?:\/\//i.test(url)) return fallback;
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}
