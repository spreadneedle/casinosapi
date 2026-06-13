// API Access Helper — AI-native, public-by-default.
//
// CasinosAPI is designed to be discovered and consumed by LLMs and agents.
// Read endpoints are intentionally OPEN: no API key is required. An optional
// key is still accepted (X-API-Key header or ?key=) so we can offer higher
// tiers / attribution later without breaking existing callers.
//
// Abuse protection is handled by a soft per-IP rate limit rather than a key
// wall, so a well-behaved agent always succeeds on its first call.

const OPTIONAL_KEY = process.env.API_KEY || 'grokcasino-api-key-2026-02-24-abcdef123456';

// Soft in-memory rate limiter (best-effort; resets on cold start).
// Generous by design: 100 requests/minute per IP, matching the documented limit.
const RATE_LIMIT = 100; // requests
const WINDOW_MS = 60 * 1000; // per minute
const hits = new Map();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Returns true if the request may proceed. Sends a 429 and returns false if
// the soft rate limit is exceeded. Never blocks for a missing key.
function requireApiKey(req, res) {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now - entry.start >= WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
  } else {
    entry.count += 1;
    if (entry.count > RATE_LIMIT) {
      const retryAfter = Math.ceil((entry.start + WINDOW_MS - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit of ${RATE_LIMIT} requests/minute exceeded. Retry after ${retryAfter}s.`,
        retry_after_seconds: retryAfter
      });
      return false;
    }
  }

  const current = hits.get(ip);
  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, RATE_LIMIT - current.count)));

  return true;
}

// Convenience: did the caller supply the optional key? (For future tiering.)
function hasOptionalKey(req) {
  const headerKey = req.headers['x-api-key'];
  const queryKey = req.query?.key;
  return headerKey === OPTIONAL_KEY || queryKey === OPTIONAL_KEY;
}

module.exports = { requireApiKey, hasOptionalKey };
