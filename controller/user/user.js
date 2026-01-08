const User = require("../../models/user")
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { JWT_TOKEN, JWT_TOKEN_EXPIRE } = require('../../config/config');
const { sendMail } = require("../../utils/sendEmail");
const { verifyAccount } = require("../../templates/VerifyAccount");
const { resetPassword } = require("../../templates/ResetPassword");

// Create Account
exports.create = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "Email already exists.",
            });
        }
        const userObject = {
            name,
            email,
            password,
        };
        const token = jwt.sign(userObject, `${JWT_TOKEN}`, {
            expiresIn: `1h`,
        });
        let body = verifyAccount(token);
        let mailSend = await sendMail(email, "Verify Account To Get In", body, null)

        return res.status(200).json({ message: 'Otp send to your Email.', mailSend });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.verifyAccount = async (req, res) => {
    try {
        const { token } = req.body;
        const data = jwt.verify(token, `${JWT_TOKEN}`);
        if (!data) {
            return res.status(400).json({
                status: false,
                message: "Invalid Token.",
            });
        }
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "Account Already Verifyed.",
            });
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await User.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            picture: "-",
            createvia: "email"
        });
        const userObject = {
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture
        };
        const newtoken = jwt.sign(userObject, `${JWT_TOKEN}`, {
            expiresIn: `${JWT_TOKEN_EXPIRE}`,
        });

        return res.status(201).json({
            status: true,
            message: "User created successfully",
            token: newtoken,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Login with Google
exports.loginWithSocial = async (req, res) => {
    try {
        const { name, email, picture } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            const user = await User.create({
                name: name,
                email: email,
                password: "Social Account",
                picture: picture,
                createvia: "google"
            });
            const userObject = {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            };
            const newtoken = jwt.sign(userObject, `${JWT_TOKEN}`, {
                expiresIn: `${JWT_TOKEN_EXPIRE}`,
            });

            return res.status(200).json({
                status: true,
                message: "User created successfully",
                token: newtoken,
            });
        }
        if (user.password !== "Social Account") {
            return res.status(400).json({
                status: false,
                message: "Use Email or Password for Login",
            });
        }
        const userObject = {
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture
        };
        const token = jwt.sign(userObject, `${JWT_TOKEN}`, {
            expiresIn: `${JWT_TOKEN_EXPIRE}`,
        });

        return res.status(200).json({
            status: true,
            message: "Login successful",
            token,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Login with Email and Passsword
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found. Please register first.",
            });
        }
        if (user.password === "Social Account") {
            return res.status(400).json({
                status: false,
                message: "Use Social Account for Login",
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: "Invalid email or password.",
            });
        }
        const userObject = {
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture
        };
        const token = jwt.sign(userObject, `${JWT_TOKEN}`, {
            expiresIn: `${JWT_TOKEN_EXPIRE}`,
        });

        return res.status(200).json({
            status: true,
            message: "Login successful",
            token,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get User by Id
exports.getById = async (req, res) => {
    try {
        const { id } = req.query;
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
                id,
                user
            });
        }

        return res.status(200).json({
            status: true,
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get User by Email
exports.getByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
                email,
                user
            });
        }

        return res.status(200).json({
            status: true,
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Forget Password
exports.resetLink = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
                email,
                user
            });
        }
        if (user.password === "Social Account") {
            return res.status(400).json({
                status: false,
                message: "Your are using Social Account Don't need to get Password.",
            });
        }

        const userObject = {
            id: user._id,
            email: user.email,
        };
        const token = jwt.sign(userObject, `${JWT_TOKEN}`, {
            expiresIn: `1h`,
        });
        let body = resetPassword(token);
        let mailSend = await sendMail(email, "Password Reset Link", body, null)

        return res.status(200).json({
            status: true,
            message: "Reset Link Send Successfully",
            mailSend
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({
                status: false,
                message: "Token and password are required.",
            });
        }
        const decoded = jwt.verify(token, JWT_TOKEN);
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { password: hashedPassword },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({
                status: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Password updated successfully.",
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Verify JWT
exports.verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"] || req.get("authorization");
        if (!authHeader) {
            return res.status(401).json({
                status: false,
                message: "No token provided.",
            });
        }
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
        const data = jwt.verify(token, JWT_TOKEN);
        return res.status(200).json({
            status: true,
            message: "Password updated successfully.",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

