const { hashPassword, verifyPassword } = require("../utilities/password.js");
const dbTool = require("../services/dbTool.js");
const jwt = require("jsonwebtoken");
const {
    JWT_SESSION_SECRET,
    JWT_REFRESH_SECRET,
    JWT_SESSION_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN
} = require("../config/config.js");
const { internalServerError, badRequest, conflict, unauthorized } = require("../utilities/errorHandlers.js");
const { User } = require("../models/user.js");


exports.authenticate = async(req, res) => {
    try {
        const token = req.body.sessionToken;

        if(!token) {
            return badRequest(res, "Missing sessionToken");
        }

        let decoded;
        // Get user data from token if it is valid
        try {
            decoded = jwt.verify(token, JWT_SESSION_SECRET);
        } catch (error) {
            return unauthorized(res, "Invalid sessionToken");
        }

        res.status(200).json({
            user: User(decoded)
        });

    } catch (error) {
        internalServerError(error, res);
    }
}

// Generate new session token
exports.refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return unauthorized(res, "Missing refreshToken");
        }

        let decoded;
        // Get user id from token if it is valid
        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch (error) {
            return unauthorized(res, "Invalid refreshToken");
        }

        // Check if the token is present in the database
        const dbToken = await dbTool.GetTokenById(decoded.user_id);
        const user = await dbTool.GetUserById(decoded.user_id);
        if(!dbToken || dbToken.token !== refreshToken) {
            return unauthorized(res, "Invalid refreshToken");
        }

        // Generate the new session token
        const sessionToken = jwt.sign(user, JWT_SESSION_SECRET, {expiresIn: JWT_SESSION_EXPIRES_IN});

        return res.status(200).json({
            success: true,
            sessionToken: sessionToken,
            user: user
        });

    } catch (error) {
        internalServerError(error, res);
    }
}

exports.register = async(req, res) => {
    try {
        const { username, password } = req.body;

        if(!username || !password) {
            return badRequest(res, "Missing username or password");
        }

        // Check if the name is already used
        const nameUsed = await dbTool.getUserByName(username);

        if(nameUsed){
            return conflict(res, "Username is already in use");
        }

        const passwordHash = await hashPassword(password);

        // Create the new user in the database
        const createdUser = await dbTool.CreateUser(username, passwordHash);

        // Generate the tokens and store refresh token in database
        const sessionToken = jwt.sign(createdUser, JWT_SESSION_SECRET, {expiresIn: JWT_SESSION_EXPIRES_IN});
        const refreshToken = jwt.sign({user_id: createdUser.user_id}, JWT_REFRESH_SECRET, {expiresIn: JWT_REFRESH_EXPIRES_IN});
        await dbTool.StoreRefreshToken(createdUser.user_id, refreshToken);

        // Set refresh token as http only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // Send user data and session token in payload
        res.status(201).json({
            success: true,
            message: "Successfully registered",
            sessionToken: sessionToken,
            user: createdUser
        });

    } catch (error) {
        internalServerError(error, res);
    }
}

exports.login = async(req, res) => {
    try {
        const { username, password } = req.body;
        if(!username || !password) {
            return badRequest(res, "Missing username or password");
        }

        // Check if username exists in the database
        const user = await dbTool.getUserByName(username);
        if(!user){
            return badRequest(res, "Invalid username");
        }

        const hash = await dbTool.GetHashedPasswordById(user.user_id);
        const passwordCorrect = await verifyPassword(password, hash);

        if(!passwordCorrect) {
            return unauthorized(res, "Invalid credentials");
        }

        // Generate the tokens and store refresh token in database
        const sessionToken = jwt.sign(user, JWT_SESSION_SECRET, {expiresIn: JWT_SESSION_EXPIRES_IN});
        const refreshToken = jwt.sign({user_id: user.user_id}, JWT_REFRESH_SECRET, {expiresIn: JWT_REFRESH_EXPIRES_IN});
        await dbTool.StoreRefreshToken(user.user_id, refreshToken);

        // Set refresh token as http only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // Send user data and session token in payload
        res.status(201).json({
            success: true,
            message: "Login successful",
            sessionToken: sessionToken,
            user: user
        });

    } catch (error) {
        internalServerError(error, res);
    }
}

exports.logout = async(req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if(!token){
            return unauthorized(res, "Missing refreshToken");
        }

        let decoded;
        // Get user id from token if it is valid
        try {
            decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (error) {
            return unauthorized(res, "Invalid refreshToken");
        }

        // Delete token from database
        await dbTool.DeleteRefreshToken(decoded.user_id);

        // Delete token from cookies
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "strict"
        });

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        internalServerError(error, res);
    }
}