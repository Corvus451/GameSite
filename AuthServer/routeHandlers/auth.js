const { hashPassword, verifyPassword } = require("../utilities/password.js");
const dbTool = require("../services/dbTool.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
    JWT_SECRET,
    JWT_SESSION_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN
} = require("../config/config.js");


exports.authenticate = async() => {

}

exports.refreshToken = async() => {
    
}

exports.register = async() => {
    
}

exports.login = async() => {
    
}

exports.logout = async() => {
    
}