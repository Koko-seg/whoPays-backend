import { Request, Response, NextFunction } from "express";

// Simple admin auth middleware using an env var ADMIN_KEY
// Clients must send header: 'x-admin-key': '<ADMIN_KEY>'
export default function adminAuth(req: Request, res: Response, next: NextFunction) {
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
