const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
    const payload = {
        username: user.username,
        is_admin: user.isAdmin || user.is_admin, // Ensure to include isAdmin flag
      };
      return jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
    }
    
    module.exports = { createToken };