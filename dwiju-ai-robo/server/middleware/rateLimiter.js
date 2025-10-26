export const rateLimiter = (rateLimiterInstance) => {
  return async (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    
    try {
      await rateLimiterInstance.consume(key);
      next();
    } catch (rejRes) {
      const remainingPoints = rejRes.remainingPoints;
      const msBeforeNext = rejRes.msBeforeNext;
      const totalHits = rejRes.totalHits;

      // Add rate limit headers
      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': rateLimiterInstance.points,
        'X-RateLimit-Remaining': remainingPoints < 0 ? 0 : remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
      });

      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(msBeforeNext / 1000),
        limit: rateLimiterInstance.points,
        remaining: remainingPoints < 0 ? 0 : remainingPoints
      });
    }
  };
};
