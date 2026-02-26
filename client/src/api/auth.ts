const BASE = '/api/auth';

export interface AuthUser {
    id: number;
    email: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export async function apiRegister(email: string, password: string, name: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sign in failed');
    return data;
}

export async function apiGetMe(token: string): Promise<AuthUser> {
    const res = await fetch(`${BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data.user;
}
