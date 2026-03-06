const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const redis = require('../config/redis');
const { authEmailQueue } = require('../queues/authEmailQueue');
const { loginSchema, signupSchema, userSignupSchema, resetPasswordSchema, onlyEmailSchema, verifyOtpSchema, changePasswordSchema } = require('../utils/input.validation');

module.exports.signup = async (req, res) => {
    try {
        const project = req.project;

        const data = userSignupSchema.parse(req.body);

        // Zod Validation (Prevents NoSQL Injection too)
        const { email, password, username, ...otherData } = userSignupSchema.parse(req.body);

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = {
            username,
            email,
            password: hashedPassword,
            emailVerified: false,
            ...otherData,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newUser);

        // Save OTP to Redis (5 mins expiry)
        await redis.set(`project:${project._id}:otp:verification:${email}`, otp, 'EX', 300);

        // Queue Email
        await authEmailQueue.add('send-verification-email', {
            email,
            otp,
            type: 'verification',
            pname: project.name
        });

        const token = jwt.sign(
            { userId: result.insertedId, projectId: project._id },
            project.jwtSecret
        );

        res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            token: token,
            userId: result.insertedId
        });

    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.issues?.[0]?.message || err.errors?.[0]?.message || "Validation failed" });
        }
        res.status(500).json({ error: err.message });
        console.log(err)
    }
}

module.exports.login = async (req, res) => {
    try {
        const project = req.project;
        // Validate Input
        const { email, password } = loginSchema.parse(req.body);

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const user = await collection.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign(
            { userId: user._id, projectId: project._id },
            project.jwtSecret
        );

        res.json({ token });

    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        res.status(500).json({ error: err.message }); // Fixed: .json()
    }
}

module.exports.me = async (req, res) => {
    try {
        const project = req.project;
        const tokenHeader = req.header('Authorization');

        if (!tokenHeader) return res.status(401).json({ error: "Access Denied: No Token Provided" });

        const token = tokenHeader.replace("Bearer ", "");

        try {
            const decoded = jwt.verify(token, project.jwtSecret);
            const collectionName = `${project._id}_users`;
            const collection = mongoose.connection.db.collection(collectionName);

            const user = await collection.findOne(
                { _id: new mongoose.Types.ObjectId(decoded.userId) },
                { projection: { password: 0 } }
            );

            if (!user) return res.status(404).json({ error: "User not found" });

            res.json(user);

        } catch (err) {
            return res.status(401).json({ error: "Invalid or Expired Token" });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ADMIN - Create User (from Dashboard)
module.exports.createAdminUser = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOne({ _id: projectId, owner: req.user._id });
        if (!project) return res.status(404).json({ error: "Project not found or access denied." });

        const parsedData = userSignupSchema.parse(req.body);
        const { email, password, username, ...otherData } = parsedData;

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const existingUser = await collection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            email,
            password: hashedPassword,
            emailVerified: true,
            ...otherData,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newUser);

        res.status(201).json({
            message: "User created successfully",
            user: { _id: result.insertedId, email, username, createdAt: newUser.createdAt }
        });

    } catch (err) {
        if (err instanceof z.ZodError) {
            console.error(err);
            return res.status(400).json({ error: err.issues?.[0]?.message || err.errors?.[0]?.message || "Validation failed" });
        }
        res.status(500).json({ error: err.message });
    }
}

// ADMIN - Reset User Password (from Dashboard)
module.exports.resetPassword = async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const project = await Project.findOne({ _id: projectId, owner: req.user._id });
        if (!project) return res.status(404).json({ error: "Project not found or access denied." });

        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// USER PROFILE ENDPOINTS

module.exports.verifyEmail = async (req, res) => {
    try {
        const project = req.project;
        const { email, otp } = verifyOtpSchema.parse(req.body);

        const redisKey = `project:${project._id}:otp:verification:${email}`;
        const storedOtp = await redis.get(redisKey);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const result = await collection.updateOne(
            { email },
            { $set: { emailVerified: true } }
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: "User not found" });

        await redis.del(redisKey);
        res.json({ message: "Email verified successfully" });

    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues?.[0]?.message || "Validation failed" });
        res.status(500).json({ error: err.message });
    }
};

module.exports.requestPasswordReset = async (req, res) => {
    try {
        const project = req.project;
        const { email } = onlyEmailSchema.parse(req.body);

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);
        
        const user = await collection.findOne({ email });
        if (!user) {
            return res.json({ message: "If that email exists, a reset code has been sent." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redis.set(`project:${project._id}:otp:reset:${email}`, otp, 'EX', 300);

        await authEmailQueue.add('send-reset-email', { email, otp, type: 'password_reset', pname: project.name });

        res.json({ message: "If that email exists, a reset code has been sent." });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues?.[0]?.message || "Validation failed" });
        res.status(500).json({ error: err.message });
    }
};

module.exports.resetPasswordUser = async (req, res) => {
    try {
        const project = req.project;
        const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

        const redisKey = `project:${project._id}:otp:reset:${email}`;
        const storedOtp = await redis.get(redisKey);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const result = await collection.updateOne(
            { email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) return res.status(404).json({ error: "User not found" });

        await redis.del(redisKey);
        res.json({ message: "Password updated successfully" });

    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues?.[0]?.message || "Validation failed" });
        res.status(500).json({ error: err.message });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const project = req.project;
        
        const tokenHeader = req.header('Authorization');
        if (!tokenHeader) return res.status(401).json({ error: "Access Denied: No Token Provided" });
        const token = tokenHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, project.jwtSecret);

        const username = req.body.username;
        if (!username || username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters." });

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(decoded.userId) },
            { $set: { username } }
        );

        res.json({ message: "Profile updated successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.changePasswordUser = async (req, res) => {
    try {
        const project = req.project;
        
        const tokenHeader = req.header('Authorization');
        if (!tokenHeader) return res.status(401).json({ error: "Access Denied: No Token Provided" });
        const token = tokenHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, project.jwtSecret);

        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

        const collectionName = `${project._id}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const user = await collection.findOne({ _id: new mongoose.Types.ObjectId(decoded.userId) });
        if (!user) return res.status(404).json({ error: "User not found" });

        const validPass = await bcrypt.compare(currentPassword, user.password);
        if (!validPass) return res.status(400).json({ error: "Invalid current password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(decoded.userId) },
            { $set: { password: hashedPassword } }
        );

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues?.[0]?.message || "Validation failed" });
        res.status(500).json({ error: err.message });
    }
};

// ADMIN: GET USER DETAILS
module.exports.getUserDetails = async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        const collectionName = `${projectId}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const user = await collection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Remove password hash before returning
        const { password, ...safeUser } = user;

        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADMIN: UPDATE CUSTOM USER FIELDS
module.exports.updateAdminUser = async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const updateData = req.body;

        // Prevent admin from inadvertently changing password hash directly from this endpoint
        delete updateData.password;
        delete updateData._id;

        const collectionName = `${projectId}_users`;
        const collection = mongoose.connection.db.collection(collectionName);

        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};