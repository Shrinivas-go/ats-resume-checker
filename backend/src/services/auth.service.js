const User = require('../models/User');
const tokenService = require('./token.service');
const { isAdminEmail } = require('../middlewares/admin');

const authService = {
    async register({ name, email, password }) {
        const existing = await User.findOne({ email });
        if (existing) throw new Error('User with this email already exists');

        const user = await User.create({ name, email, password });
        const tokens = tokenService.generateTokens(user._id, user.role);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return { user: user.toJSON(), tokens };
    },

    async login({ email, password }) {
        const user = await User.findOne({ email }).select('+password');
        if (!user) throw new Error('Invalid email or password');
        if (!user.isActive) throw new Error('Account is deactivated');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new Error('Invalid email or password');

        const tokens = tokenService.generateTokens(user._id, user.role);
        user.refreshToken = tokens.refreshToken;
        user.lastLogin = new Date();
        await user.save();

        return { user: user.toJSON(), tokens };
    },

    async refreshToken(refreshToken) {
        const decoded = tokenService.verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) throw new Error('Invalid refresh token');
        if (!user.isActive) throw new Error('Account is deactivated');

        const tokens = tokenService.generateTokens(user._id, user.role);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return { tokens };
    },

    async logout(userId) {
        await User.findByIdAndUpdate(userId, { refreshToken: null });
    },

    /**
     * Google OAuth — creates account if new, links if existing email, or logs in.
     * If a local user later signs in with Google, the accounts merge.
     */
    async googleAuth({ googleId, email, name, avatar }) {
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                if (avatar) user.avatar = avatar;
            }
            if (!user.isActive) throw new Error('Account is deactivated');

            const tokens = tokenService.generateTokens(user._id, user.role);
            user.refreshToken = tokens.refreshToken;
            user.lastLogin = new Date();
            await user.save();

            return { user: user.toJSON(), tokens, isNewUser: false };
        }

        user = await User.create({ name, email, googleId, authProvider: 'google', avatar });
        const tokens = tokenService.generateTokens(user._id, user.role);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        return { user: user.toJSON(), tokens, isNewUser: true };
    },

    async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const data = user.toJSON();
        data.isAdmin = isAdminEmail(user.email);
        return data;
    },
};

module.exports = authService;
