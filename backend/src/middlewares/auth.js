const tokenService = require('../services/token.service');
const User = require('../models/User');
const { isAdminEmail } = require('./admin');

/**
 * Require a valid JWT access token.
 * Reads from Authorization header or accessToken cookie.
 * Attaches user info to req.user on success.
 */
const auth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided', code: 'NO_TOKEN' });
        }

        let decoded;
        try {
            decoded = tokenService.verifyAccessToken(token);
        } catch (err) {
            const code = err.code === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
            return res.status(401).json({ success: false, message: err.message, code });
        }

        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
        if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated', code: 'USER_DEACTIVATED' });

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            isAdmin: isAdminEmail(user.email),
        };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Authentication failed', code: 'AUTH_ERROR' });
    }
};

/**
 * Optional auth — attaches user if token present, continues silently otherwise.
 * Used on routes that work for both anonymous and authenticated users.
 */
const optionalAuth = async (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next();

    try {
        const decoded = tokenService.verifyAccessToken(token);
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
            req.user = {
                id: user._id,
                email: user.email,
                role: user.role,
                isAdmin: isAdminEmail(user.email),
            };
        }
    } catch { /* token invalid — proceed without user */ }
    next();
};

/** Extract bearer token from header or cookie. */
function extractToken(req) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) return header.substring(7);
    return req.cookies?.accessToken || null;
}

module.exports = { auth, optionalAuth };
