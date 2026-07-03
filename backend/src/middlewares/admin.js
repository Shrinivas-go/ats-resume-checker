const config = require('../config/env');

/** Check if email matches the configured admin. */
const isAdminEmail = (email) => {
    if (!email || !config.adminEmail) return false;
    return email.toLowerCase() === config.adminEmail.toLowerCase();
};

/** Middleware: attach isAdmin flag to request. */
const checkAdmin = (req, res, next) => {
    req.isAdmin = !!(req.user && isAdminEmail(req.user.email));
    next();
};

module.exports = { isAdminEmail, checkAdmin };
