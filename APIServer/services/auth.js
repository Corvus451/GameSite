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

    // Throw error if the token is invalid
    if (result.status != 200) {
        const error = Error(result);
        error.name = "Authentication error";
        throw error;
    }

    const data = await result.json();

    return data.user;
}

// Middleware for protected endpoints
const authHandler = async (req, res, next) => {
    try {
        // Get the session token from request headers
        const sessionToken = req.headers.authorization?.split(' ')[1];


        if (!sessionToken) {
            return unauthorized(res, "sessionToken missing.")
        }

        let user;

        // Get user data from token if it is valid
        try {
            user = await authenticate(sessionToken);
        } catch (error) {
            console.error(error);
            return unauthorized(res, "Invalid sessionToken")
        }

        if (!user) {
            return unauthorized(res, "Invalid sessionToken");
        }

        // Set req.user so it can be used in the next function
        req.user = user;
        next();

    } catch (error) {
        internalServerError(error, res);
    }
}

module.exports = { authHandler };