require('dotenv').config();

module.exports = {
    SERVER_PORT: process.env.SERVER_PORT || 3001,
    PGUSER: process.env.PGUSER || "postgres",
    PGPASSWORD: process.env.PGPASSWORD || "postgres",
    PGDATABASE: process.env.PGDATABASE,
    PGHOST: process.env.PGHOST,
    PGPORT: process.env.PGPORT || 5432,
    ENDPOINT_PREFIX: process.env.ENDPOINT_PREFIX || "/api/auth_v1",
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    DEVENV: process.env.DEVENV
}