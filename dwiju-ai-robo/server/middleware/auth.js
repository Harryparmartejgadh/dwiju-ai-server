import { getJwtSecret } from '../config/validate.js';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' && /^Bearer [^ ]+$/.test(authHeader) ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN' 
    });
  }

  jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED' 
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token',
          code: 'INVALID_TOKEN' 
        });
      }
      return res.status(403).json({ 
        error: 'Token verification failed',
        code: 'TOKEN_ERROR' 
      });
    }

    if (!decoded || typeof decoded !== 'object' || !decoded.userId || !['user', 'admin', 'moderator'].includes(decoded.role)) {
      return res.status(401).json({ error: 'Invalid token claims', code: 'INVALID_CLAIMS' });
    }
    req.user = decoded;
    next();
  });
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED' 
      });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE',
        required: roles,
        current: userRole
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireModerator = requireRole(['admin', 'moderator']);
