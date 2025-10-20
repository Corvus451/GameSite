require('dotenv').config();

module.exports = {
    SERVER_PORT: process.env.SERVER_PORT || 3000,
    PGUSER: process.env.PGUSER || "postgres",
    PGPASSWORD: process.env.PGPASSWORD || "test1234",
    PGDATABASE: process.env.PGDATABASE,
    PGHOST: process.env.PGHOST,
    PGPORT: process.env.PGPORT || 5432,
    ENDPOINT_PREFIX: process.env.ENDPOINT_PREFIX || "/api",
    AUTH_ENDPOINT: process.env.AUTH_ENDPOINT || "/api/auth_v1",
    AUTH_HOST: process.env.AUTH_HOST || "http://localhost:3001",
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    DEVENV: process.env.DEVENV
}