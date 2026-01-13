// middleware/auth.js
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    // Token yoksa anonim erişime izin ver (sadece GET için)
    if (req.method === 'GET') {
      return next(); // GET istekleri için auth zorunlu değil
    }
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, username }
    return next();
  } catch (err) {
    console.error("Token verify error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden (role)" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };