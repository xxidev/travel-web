import pool from '../db';
import bcrypt from 'bcryptjs';

export interface User {
    id: number;
    email: string;
    name: string;
    created_at: Date;
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query<User>(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [email.toLowerCase(), passwordHash, name]
    );
    return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    const result = await pool.query(
        'SELECT id, email, name, password, created_at FROM users WHERE email = $1',
        [email.toLowerCase()]
    );
    return result.rows[0] || null;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}
