const express = require("express");
const { SERVER_PORT, ENDPOINT_PREFIX } = require("./config/config.js");
const { authHandler } = require("./services/auth.js");


const app = express();

app.use(express.json());

// ENDPOINTS

app.get(ENDPOINT_PREFIX + "/createlobby", authHandler, );