const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.hashPassword = async (password) => {
    try {
      // Hash the password with the specified number of salt rounds
      const hash = await bcrypt.hash(password, saltRounds);
      return hash;
    } catch (error) {
      console.error('Error hashing password:', error);
    }
}

exports.verifyPassword = async (password, hash) => {
    try {
      // Compare the provided password with the stored hash
      const match = await bcrypt.compare(password, hash);
      return match;
    } catch (error) {
      console.error('Error verifying password:', error);
    }
}