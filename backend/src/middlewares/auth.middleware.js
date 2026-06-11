import jwt from "jsonwebtoken";

/* ==================================================
   🔐 Authentication Middleware
================================================== */

export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing or invalid",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined");

            return res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
        }

        /* ✅ مهم‌ترین اصلاح */
        req.user = {
            _id: decoded.id,
            id: decoded.id,
            role: decoded.role || "user",
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

/* ==================================================
   🛡️ Role Authorization Middleware
================================================== */

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const userRole = req.user.role?.toLowerCase();
        const allowedRoles = roles.map((role) => role.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        next();
    };
};
