const jwt = require("jsonwebtoken");

// verify manager middleware
const verifyManager = (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, access denied",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Check role
    if (decoded.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Access denied, manager only",
      });
    }

    // 4️⃣ Attach user to request
    req.user = decoded;

    // 5️⃣ Continue
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyManager;