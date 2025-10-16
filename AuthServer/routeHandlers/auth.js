const { hashPassword, verifyPassword } = require("../utilities/password.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/config.js");
const dbTool = require("../services/dbTool.js");


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