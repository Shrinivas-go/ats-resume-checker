/**
 * Admin access control based on ADMIN_EMAIL environment variable.
 * Admin users bypass credit/paywall checks.
 */


/**
 * Check if a user email is an admin/tester
 * @param {string} email - User email to check
 * @returns {boolean}
 */
const isAdminEmail = (email) => {
    if (!email) return false;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return false;
    return email.toLowerCase() === adminEmail.toLowerCase();
};

/**
 * Middleware: Adds `req.isAdmin` to request
 */
const checkAdmin = (req, res, next) => {
    req.isAdmin = !!(req.user && isAdminEmail(req.user.email));
    if (req.isAdmin) req.user.isAdmin = true;
    next();
};

/**
 * Middleware: Require admin access
 * Returns 403 if not admin
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || !isAdminEmail(req.user.email)) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required',
            code: 'ADMIN_REQUIRED',
        });
    }
    req.isAdmin = true;
    next();
};

module.exports = {
    isAdminEmail,
    checkAdmin,
    requireAdmin,
};
