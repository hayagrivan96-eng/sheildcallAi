import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { ZodSchema, ZodError } from 'zod';

// Express Rate Limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Helmet Config
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'ws:', 'wss:', 'https://api.openai.com', 'https://generativelanguage.googleapis.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// CORS Config
export const corsMiddleware = cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Request body/query validator middleware using Zod
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error during validation' });
    }
  };
};

// Simple input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitize = (value: any): any => {
    if (typeof value === 'string') {
      // Basic sanitization: strip HTML tags and trim
      return value.replace(/<[^>]*>/g, '').trim();
    }
    if (Array.isArray(value)) {
      return value.map(sanitize);
    }
    if (value !== null && typeof value === 'object') {
      const cleaned: any = {};
      for (const key in value) {
        cleaned[key] = sanitize(value[key]);
      }
      return cleaned;
    }
    return value;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) {
    const sanitized = sanitize(req.query);
    for (const key in req.query) delete req.query[key];
    Object.assign(req.query, sanitized);
  }
  if (req.params) {
    const sanitized = sanitize(req.params);
    for (const key in req.params) delete req.params[key];
    Object.assign(req.params, sanitized);
  }

  next();
};
