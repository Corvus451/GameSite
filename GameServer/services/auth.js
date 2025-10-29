const { AUTH_ENDPOINT, AUTH_HOST } = require("../config/config.js");

// Authenticate clients
exports.authenticate = async (token) => {

    const result = await fetch(AUTH_HOST + AUTH_ENDPOINT + "/authenticate", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + token
        },
        // body: JSON.stringify({
        //     sessionToken: token
        // })
    });

    if (!result.ok) {
        return null;
    }

    const data = await result.json();

    return data.user || null;
}