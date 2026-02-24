import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface AuthRequest extends Request {
    userId?: number;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized, please sign in' });
        return;
    }

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, config.jwt.secret) as { userId: number };
        req.userId = payload.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Token is invalid or expired' });
    }
}
