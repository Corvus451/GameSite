require('dotenv').config();

module.exports = {
    SERVER_PORT: process.env.SERVER_PORT || 3333,
    HTTP_PORT: process.env.HTTP_PORT || 8080,
    AUTH_ENDPOINT: process.env.AUTH_ENDPOINT || "/api/auth_v1",
    AUTH_HOST: process.env.AUTH_HOST || "http://localhost:3001",
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    DEVENV: process.env.DEVENV
}