// exports.User = (user_id, username, admin, created_at) => {
//     return {
//         user_id: user_id,
//         username: username,
//         admin: admin,
//         created_at: created_at
//     }
// }

exports.User = (dbResult) => {
    return {
        user_id: dbResult.user_id,
        username: dbResult.username,
        admin: dbResult.admin,
        created_at: dbResult.created_at
    };
}