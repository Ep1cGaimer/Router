const requests = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 10;
const WINDOW_MS = 60_000;

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = requests.get(ip);
    if(!entry || now > entry.resetAt) {
        requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return true;
    }
    if (entry.count >= LIMIT) return false;
    entry.count++;
    return false;
}
