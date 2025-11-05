require('dotenv').config();

module.exports = {
    SERVER_PORT: process.env.SERVER_PORT || 3001,
    PGUSER: process.env.PGUSER || "postgres",
    PGPASSWORD: process.env.PGPASSWORD || "postgres",
    PGDATABASE: process.env.PGDATABASE || "auth",
    PGHOST: process.env.PGHOST || "localhost",
    PGPORT: process.env.PGPORT || 5432,
    ENDPOINT_PREFIX: process.env.ENDPOINT_PREFIX || "/api/auth_v1",
    JWT_SESSION_SECRET: process.env.JWT_SESSION_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_SESSION_EXPIRES_IN: process.env.JWT_SESSION_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "24h",
    DEVENV: process.env.DEVENV
}