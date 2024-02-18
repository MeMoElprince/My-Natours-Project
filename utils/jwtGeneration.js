const jwt = require('jsonwebtoken');

module.exports = (payload, expiresIn = process.env.JWT_EXPIRES_IN) => {
    const token = jwt.sign({...payload}, process.env.JWT_SECRET, {
        expiresIn
    });
    return token;
}
