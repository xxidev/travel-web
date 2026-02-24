import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

function required(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

const config = {
    server: {
        port:         Number(required('PORT')),
        clientOrigin: required('CLIENT_ORIGIN'),
    },
    db: {
        host:     required('DB_HOST'),
        port:     Number(required('DB_PORT')),
        name:     required('DB_NAME'),
        user:     required('DB_USER'),
        password: required('DB_PASSWORD'),
    },
    jwt: {
        secret:    required('JWT_SECRET'),
        expiresIn: required('JWT_EXPIRES_IN'),
    },
    googlePlaces: {
        apiKey: required('GOOGLE_PLACES_API_KEY'),
    },
} as const;

export default config;
