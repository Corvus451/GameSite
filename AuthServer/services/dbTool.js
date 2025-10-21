const { User } = require("../models/user.js");
const { query } = require("./db.js");

exports.CreateUser = async (username, passwordHash) => {
    const result = await query("INSERT INTO users(username) VALUES($1) RETURNING *", [username]);
    await query("INSERT INTO passwords(user_id, password_hash) VALUES($1, $2)", [result[0].user_id, passwordHash]);
    return User(result[0]);
}

exports.getUserByName = async(username) => {
    const result = await query("SELECT * FROM users WHERE username = $1", [username]);
    if(result[0] == null){
        return null;
    }
    
    return User(result[0]);
}

exports.GetUserById = async (id) => {
    const result = await query("SELECT * FROM users WHERE user_id = $1", [id]);
    if(result[0] == null){
        return null;
    }
    return User(result[0]);
}

exports.GetHashedPasswordById = async (id) => {
    const result = await query("SELECT password_hash FROM passwords WHERE user_id = $1", [id]);
    return result[0].password_hash;
}

exports.DeleteRefreshToken = async (user_id) => {
    const result = await query("DELETE FROM refresh_tokens WHERE user_id = $1 RETURNING *", [user_id]);
    return result[0];
}

exports.GetTokenById = async (id) => {
    const result = await query("SELECT * FROM refresh_tokens WHERE user_id = $1", [id]);
    return result[0];
}

exports.StoreRefreshToken = async (user_id, token) => {
    const result = await query("INSERT INTO refresh_tokens(user_id, token) VALUES($1, $2)", [user_id, token]);
    return result[0];
}