const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const logger = require("../utils/logger");
const sendEmail = require("../utils/sendEmail");
const { validateEmail, validatePassword, validateRequired } = require("../utils/validator");
const { AppError } = require("../utils/errorHandler");
const { HTTP_STATUS, ERROR_MESSAGES, JWT_EXPIRY } = require("../config/constants");

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        const requiredErrors = validateRequired({ name, email, password, confirmPassword });
        if (requiredErrors.length > 0) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                errors: requiredErrors,
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }

        if (!validateEmail(email)) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                message: 'Invalid email format',
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }

        if (!validatePassword(password)) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }

        if (password !== confirmPassword) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                message: 'Passwords do not match',
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: ERROR_MESSAGES.USER_EXISTS,
                status: HTTP_STATUS.CONFLICT
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword
        });

        logger.info('User registered successfully', { userId: user._id, email: user.email });

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                coins: user.coins,
                ownedItems: user.ownedItems || [],
                activeTheme: user.activeTheme || null,
                activeAvatar: user.activeAvatar || null,
                hints: user.hints || 0,
            },
            status: HTTP_STATUS.CREATED
        });
    } catch (error) {
        logger.error('Registration error', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                errors: messages,
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        const requiredErrors = validateRequired({ email, password });
        if (requiredErrors.length > 0) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                errors: requiredErrors,
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }

        if (!validateEmail(email)) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                message: 'Invalid email format',
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS,
                status: HTTP_STATUS.UNAUTHORIZED
            });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            logger.warn('Failed login attempt', { email });
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS,
                status: HTTP_STATUS.UNAUTHORIZED
            });
        }

        // Update last active date
        user.lastActiveDate = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        logger.info('User logged in successfully', { userId: user._id, email: user.email });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                coins: user.coins,
                streak: user.streak,
                ownedItems: user.ownedItems || [],
                activeTheme: user.activeTheme || null,
                activeAvatar: user.activeAvatar || null,
                hints: user.hints || 0,
            },
            status: HTTP_STATUS.OK
        });
    } catch (error) {
        logger.error('Login error', error);
        next(error);
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                coins: user.coins,
                streak: user.streak,
                role: user.role,
                ownedItems: user.ownedItems || [],
                activeTheme: user.activeTheme || null,
                activeAvatar: user.activeAvatar || null,
                hints: user.hints || 0,
            },
            status: HTTP_STATUS.OK
        });
    } catch (error) {
        logger.error('Token verification error', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
        });
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                message: "Please provide an email",
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "There is no user with that email",
                status: HTTP_STATUS.NOT_FOUND
            });
        }
        
        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        
        // Create reset URL
        // Using frontend host URL from env, default back to localhost
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        
        const message = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;
        const html = `<p>You requested a password reset.</p><p>Please click this link to reset your password:</p><a href="${resetUrl}" target="_blank">${resetUrl}</a>`;
        
        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset Request",
                message,
                html
            });
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Email sent"
            });
        } catch (err) {
            logger.error("Error sending email", err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Email could not be sent",
                status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            });
        }
    } catch (error) {
        logger.error("Forgot password error", error);
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.resettoken)
            .digest("hex");
            
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Invalid or expired token",
                status: HTTP_STATUS.BAD_REQUEST
            });
        }
        
        const { password, confirmPassword } = req.body;
        
        if (!validatePassword(password)) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                message: "Password must be at least 8 characters with uppercase, lowercase, and number",
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
                success: false,
                message: "Passwords do not match",
                status: HTTP_STATUS.VALIDATION_ERROR
            });
        }
        
        // Set new password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save();
        
        // Generate new token and login
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );
        
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Password updated successfully",
            token,
            status: HTTP_STATUS.OK
        });
    } catch (error) {
        logger.error("Reset password error", error);
        next(error);
    }
};