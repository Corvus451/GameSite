const { AUTH_ENDPOINT, AUTH_HOST } = require("../config/config.js");
const { internalServerError, unauthorized } = require("../utilities/errorHandlers.js");

const authenticate = async (token) => {

    const result = await fetch(AUTH_HOST + AUTH_ENDPOINT + "/authenticate", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionToken: token
        })
    });

    if (result.status != 200) {
        const error = Error(result);
        error.name = "Authentication error";
        throw error;
    }

    const data = await result.json();

    return data.user;
}

const authHandler = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization?.split(' ')[1];


        if (!sessionToken) {
            return unauthorized(res, "sessionToken missing.")
        }

        let user;

        try {
            user = await authenticate(sessionToken);
        } catch (error) {
            console.error(error);
            return unauthorized(res, "Invalid sessionToken")
        }

        if (!user) {
            return unauthorized(res, "Invalid sessionToken");
        }

        req.user = user;
        next();

    } catch (error) {
        internalServerError(error, res);
    }
}

module.exports = { authHandler };