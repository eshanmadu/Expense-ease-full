import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.split(" ")[1];
    console.log('Extracted token:', token ? 'Present' : 'Missing');
    
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    // Provide both shapes for compatibility across controllers
    req.user = { id: decoded.id };
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Keep the old export for backward compatibility
export const authMiddleware = authenticateToken;
