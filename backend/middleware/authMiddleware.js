const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure payload contains userId
    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

    req.user = {
      userId: decoded.userId.toString() // Ensure string format
    };
    
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};