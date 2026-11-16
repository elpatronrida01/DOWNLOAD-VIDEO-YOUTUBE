import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    if (now > record.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(options: { maxRequests: number; windowMs: number }) {
  const { maxRequests, windowMs } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Get client IP with reverse-proxy support
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown-client';

    const now = Date.now();
    let record = ipRequestMap.get(clientIp);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipRequestMap.set(clientIp, record);
    } else {
      record.count += 1;
    }

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment before trying again.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    next();
  };
}
