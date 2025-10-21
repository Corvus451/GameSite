const { AUTH_ENDPOINT, AUTH_HOST } = require("../config/config.js");

exports.authenticate = async (token) => {

    const result = await fetch(AUTH_HOST + AUTH_ENDPOINT + "/authenticate", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionToken: token
        })
    });

    if (!result.ok) {
        return null;
    }

    const data = await result.json();

    return data.user;
}