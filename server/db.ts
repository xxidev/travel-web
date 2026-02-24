import { Pool } from 'pg';
import config from './config';

const pool = new Pool({
    host:     config.db.host,
    port:     config.db.port,
    database: config.db.name,
    user:     config.db.user,
    password: config.db.password,
});

pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
});

export default pool;
