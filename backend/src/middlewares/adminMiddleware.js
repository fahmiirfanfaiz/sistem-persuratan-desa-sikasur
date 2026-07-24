import jwt from "jsonwebtoken";

/**
 * Middleware: verify JWT and require ADMIN role.
 * Must be used after authenticate middleware.
 */
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Missing or invalid Authorization header",
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

export default requireAdmin;
