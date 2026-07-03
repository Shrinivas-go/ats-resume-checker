const tokenService = require('../services/token.service');
const User = require('../models/User');
const { isAdminEmail } = require('./admin');

/**
 * Verify JWT access token from header or cookie.
 * Attaches user info to req.user on success.
 */
const auth = async (req, res, next) => {
    try {
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                code: 'NO_TOKEN',
            });
        }

        let decoded;
        try {
            decoded = tokenService.verifyAccessToken(token);
        } catch (err) {
            if (err.code === 'TOKEN_EXPIRED') {
                return res.status(401).json({
                    success: false,
                    message: 'Access token has expired. Please refresh your session.',
                    code: 'TOKEN_EXPIRED',
                });
            }
            return res.status(401).json({
                success: false,
                message: err.message || 'Invalid token.',
                code: err.code || 'TOKEN_INVALID',
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account not found.',
                code: 'USER_NOT_FOUND',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account has been deactivated.',
                code: 'USER_DEACTIVATED',
            });
        }

        const isAdmin = isAdminEmail(user.email);

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            isAdmin,
            bypassPaywall: isAdmin,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed.',
            code: 'AUTH_ERROR',
        });
    }
};

/**
 * Role authorization — must be used after auth middleware.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
                code: 'NO_AUTH',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                code: 'FORBIDDEN',
            });
        }

        next();
    };
};

/**
 * Optional auth — attaches user if token is present, doesn't reject otherwise.
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            try {
                const decoded = tokenService.verifyAccessToken(token);
                const user = await User.findById(decoded.userId);

                if (user && user.isActive) {
                    const isAdmin = isAdminEmail(user.email);
                    req.user = {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        isAdmin,
                        bypassPaywall: isAdmin,
                    };
                }
            } catch {
                // Token invalid, but that's okay for optional auth
                // Just proceed without user
            }
        }

        next();
    } catch (error) {
        // Don't fail request for optional auth errors
        next();
    }
};

module.exports = {
    auth,
    authorize,
    optionalAuth,
};
