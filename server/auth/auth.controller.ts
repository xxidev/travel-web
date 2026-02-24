import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import pool from '../db';
import { createUser, findUserByEmail, verifyPassword } from './auth.service';
import { AuthRequest } from './auth.middleware';

function signToken(userId: number): string {
    return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
}

export async function register(req: Request, res: Response): Promise<void> {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password, and name are required' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }

    try {
        const existing = await findUserByEmail(email);
        if (existing) {
            res.status(409).json({ error: 'An account with this email already exists' });
            return;
        }

        const user = await createUser(email, password, name);
        const token = signToken(user.id);

        res.status(201).json({
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed, please try again' });
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const valid = await verifyPassword(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = signToken(user.id);
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed, please try again' });
    }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
        const result = await pool.query(
            'SELECT id, email, name FROM users WHERE id = $1',
            [req.userId]
        );
        const user = result.rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}
