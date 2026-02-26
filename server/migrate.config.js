require('dotenv').config({ path: __dirname + '/.env' });

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

module.exports = {
  databaseUrl: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  migrationsTable: 'pgmigrations',
  dir: 'migrations',
};
