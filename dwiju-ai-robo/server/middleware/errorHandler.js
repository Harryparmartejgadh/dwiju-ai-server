export const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    message: 'Internal server error',
    status: 500,
    code: 'INTERNAL_ERROR'
  };

  // MongoDB/Mongoose errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      message: 'Validation Error',
      details: messages,
      status: 400,
      code: 'VALIDATION_ERROR'
    };
  }

  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      status: 400,
      code: 'INVALID_ID'
    };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `Duplicate value for ${field}`,
      status: 409,
      code: 'DUPLICATE_ERROR'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // OpenAI API errors
  if (err.status) {
    switch (err.status) {
      case 401:
        error = {
          message: 'AI service authentication failed',
          status: 500,
          code: 'AI_AUTH_ERROR'
        };
        break;
      case 429:
        error = {
          message: 'AI service rate limit exceeded',
          status: 429,
          code: 'AI_RATE_LIMIT'
        };
        break;
      case 500:
        error = {
          message: 'AI service temporarily unavailable',
          status: 503,
          code: 'AI_SERVICE_ERROR'
        };
        break;
    }
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    error: error.message,
    code: error.code,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.message 
    })
  });
};
