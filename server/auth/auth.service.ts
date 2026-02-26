import prisma from '../prisma';
import bcrypt from 'bcryptjs';

export interface User {
    id: number;
    email: string;
    name: string;
    created_at: Date;
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            password: passwordHash,
            name,
        },
        select: { id: true, email: true, name: true, createdAt: true },
    });
    return { id: user.id, email: user.email, name: user.name, created_at: user.createdAt };
}

export async function findUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        created_at: user.createdAt,
    };
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}
