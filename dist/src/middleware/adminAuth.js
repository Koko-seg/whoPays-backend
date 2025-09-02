"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminAuth;
// Simple admin auth middleware using an env var ADMIN_KEY
// Clients must send header: 'x-admin-key': '<ADMIN_KEY>'
function adminAuth(req, res, next) {
    const adminKey = process.env.ADMIN_KEY;
    const provided = req.header("x-admin-key");
    if (!adminKey) {
        console.error("ADMIN_KEY is not set in environment");
        return res.status(500).json({ message: "Admin auth misconfigured" });
    }
    if (!provided || provided !== adminKey) {
        return res.status(401).json({ message: "Unauthorized: invalid admin key" });
    }
    return next();
}
