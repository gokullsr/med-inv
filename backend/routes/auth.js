import express from "express";
import Admin from "../models/Admin.js";

const router = express.Router();

// POST /api/auth/login - Admin Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // Verify password (plain text comparison as per user's requirement)
        if (admin.password !== password) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }

        // Update last login timestamp
        admin.lastLogin = new Date();
        await admin.save();

        // Return success with admin info (exclude password)
        res.json({
            success: true,
            message: "Login successful",
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                lastLogin: admin.lastLogin
            }
        });

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({
            success: false,
            error: "Server error during authentication"
        });
    }
});

// GET /api/auth/verify - Check if admin session is valid
router.get("/verify", async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, error: "Email is required" });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });

        if (!admin) {
            return res.status(401).json({ success: false, error: "Admin not found" });
        }

        res.json({
            success: true,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// POST /api/auth/seed - Seed default admin (only works if no admin exists)
router.post("/seed", async (req, res) => {
    try {
        const existingAdmin = await Admin.findOne({ email: "admin@gmail.com" });

        if (existingAdmin) {
            return res.json({
                success: true,
                message: "Default admin already exists",
                seeded: false
            });
        }

        const defaultAdmin = new Admin({
            email: "admin@gmail.com",
            password: "admin@124",
            name: "JYO Admin",
            role: "admin",
            isActive: true
        });

        await defaultAdmin.save();

        res.status(201).json({
            success: true,
            message: "Default admin created successfully",
            seeded: true
        });
    } catch (err) {
        console.error("❌ Seed error:", err);
        res.status(500).json({ success: false, error: "Failed to seed admin" });
    }
});

export default router;
