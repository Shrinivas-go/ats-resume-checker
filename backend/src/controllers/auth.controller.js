const authService = require('../services/auth.service');
const config = require('../config/env');

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/',
});

const authController = {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const { user, tokens } = await authService.register({ name, email, password });

            res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
            res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

            return res.status(201).json({ success: true, message: 'Registration successful', user, tokens });
        } catch (error) {
            const status = error.message.includes('already exists') ? 409 : 400;
            return res.status(status).json({ success: false, message: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const { user, tokens } = await authService.login({ email, password });

            res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
            res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

            return res.status(200).json({ success: true, message: 'Login successful', user, tokens });
        } catch (error) {
            return res.status(401).json({ success: false, message: error.message });
        }
    },

    async refresh(req, res) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ success: false, message: 'Refresh token required', code: 'NO_REFRESH_TOKEN' });
            }

            const { tokens } = await authService.refreshToken(refreshToken);

            res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
            res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

            return res.status(200).json({ success: true, tokens });
        } catch (error) {
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });
            const code = error.message.includes('expired') ? 'REFRESH_TOKEN_EXPIRED' : 'REFRESH_FAILED';
            return res.status(401).json({ success: false, message: error.message, code });
        }
    },

    async logout(req, res) {
        try {
            if (req.user) await authService.logout(req.user.id);
        } catch { /* still clear cookies even if DB op fails */ }

        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        return res.status(200).json({ success: true, message: 'Logged out' });
    },

    async me(req, res) {
        try {
            const user = await authService.getUserById(req.user.id);
            return res.status(200).json({ success: true, user });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    },

    /**
     * Google OAuth — server-side JWT verification.
     * Decodes and verifies the Google ID token cryptographically,
     * checking audience matches our client ID.
     */
    async googleAuth(req, res) {
        try {
            const { credential } = req.body;
            if (!credential) {
                return res.status(400).json({ success: false, message: 'Google credential required' });
            }

            const { OAuth2Client } = require('google-auth-library');
            const client = new OAuth2Client(config.google.clientId);

            let ticket;
            try {
                ticket = await client.verifyIdToken({
                    idToken: credential,
                    audience: config.google.clientId,
                });
            } catch (verifyError) {
                return res.status(401).json({ success: false, message: 'Google token verification failed' });
            }

            const payload = ticket.getPayload();
            const { sub: googleId, email, name, picture: avatar } = payload;

            if (!googleId || !email) {
                return res.status(400).json({ success: false, message: 'Invalid Google credential' });
            }

            const { user, tokens, isNewUser } = await authService.googleAuth({ googleId, email, name, avatar });

            res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
            res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

            return res.status(200).json({
                success: true,
                message: isNewUser ? 'Account created' : 'Login successful',
                user, tokens, isNewUser,
            });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message || 'Google auth failed' });
        }
    },
};

module.exports = authController;
