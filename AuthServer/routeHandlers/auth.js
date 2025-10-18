const { hashPassword, verifyPassword } = require("../utilities/password.js");
const dbTool = require("../services/dbTool.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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
        console.log("SESSION TOKEN:");
        console.log(token);

        if(!token) {
            return badRequest(res, "Missing sessionToken");
        }

        let decoded;

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

exports.refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return unauthorized(res, "Missing refreshToken");
        }

        let decoded;

        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch (error) {
            return unauthorized(res, "Invalid refreshToken");
        }

        const dbToken = await dbTool.GetTokenById(decoded.user_id);
        const user = await dbTool.GetUserById(decoded.user_id);
        if(!dbToken || dbToken.token !== refreshToken) {
            return unauthorized(res, "Invalid refreshToken");
        }

        const sessionToken = jwt.sign(user, JWT_SESSION_SECRET, {expiresIn: JWT_SESSION_EXPIRES_IN});

        return res.status(200).json({
            success: true,
            sessionToken: sessionToken
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

        const nameUsed = await dbTool.getUserByName(username);

        if(nameUsed){
            return conflict(res, "Username is already in use");
        }

        const passwordHash = await hashPassword(password);

        const createdUser = await dbTool.CreateUser(username, passwordHash);

        const sessionToken = jwt.sign(createdUser, JWT_SESSION_SECRET, {expiresIn: JWT_SESSION_EXPIRES_IN});
        const refreshToken = jwt.sign({user_id: createdUser.user_id}, JWT_REFRESH_SECRET, {expiresIn: JWT_REFRESH_EXPIRES_IN});
        await dbTool.StoreRefreshToken(createdUser.user_id, refreshToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        res.status(201).json({
            success: true,
            message: "Successfully registered",
            sessionToken: sessionToken
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

        const user = await dbTool.getUserByName(username);
        if(!user){
            return badRequest(res, "Invalid username");
        }

        const hash = await dbTool.GetHashedPasswordById(user.user_id);
        const passwordCorrect = await verifyPassword(password, hash);

        if(!passwordCorrect) {
            return unauthorized(res, "Invalid credentials");
        }

        const sessionToken = jwt.sign(user, JWT_SESSION_SECRET, {expiresIn: JWT_SESSION_EXPIRES_IN});
        const refreshToken = jwt.sign({user_id: user.user_id}, JWT_REFRESH_SECRET, {expiresIn: JWT_REFRESH_EXPIRES_IN});
        await dbTool.StoreRefreshToken(user.user_id, refreshToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        res.status(201).json({
            success: true,
            message: "Login successful",
            sessionToken: sessionToken
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

        try {
            decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (error) {
            return unauthorized(res, "Invalid refreshToken");
        }

        await dbTool.DeleteRefreshToken(decoded.user_id);
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