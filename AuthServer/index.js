const express = require("express");
const cookieParser = require("cookie-parser");

const auth = require("./routeHandlers/auth.js");

const { SERVER_PORT, ENDPOINT_PREFIX } = require("./config/config");

const app = express();

app.use(express.json());

// endpoints
app.post(ENDPOINT_PREFIX + "/authenticate", auth.authenticate);
app.post(ENDPOINT_PREFIX + "/refreshtoken", cookieParser(), auth.refreshToken);
app.post(ENDPOINT_PREFIX + "/register", auth.register);
app.post(ENDPOINT_PREFIX + "/login", auth.login);
app.post(ENDPOINT_PREFIX + "/logout", cookieParser(), auth.logout);



try {
    app.listen(SERVER_PORT, '0.0.0.0', ()=>{
    console.log(`Server is listening at PORT ${SERVER_PORT}`);
});
} catch (error) {
    console.error(error);
    process.exit(1);
}