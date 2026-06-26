import cors from 'cors';
import helmet from 'helmet';
import express from 'express';

export const corsMiddleware = cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
});

export const helmetMiddleware = helmet();

export const sanitizeInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim().slice(0, 10000);
      }
    });
  }
  next();
};
