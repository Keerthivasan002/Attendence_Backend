import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer')) {
      return res.status(401).json({ status: 0, response: "Token not provided" });
    }

    const validateToken = token.split(" ")[1];
    jwt.verify(validateToken, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ status: 0, response: "Session expired" });
        } else {
          return res.status(401).json({ status: 0, response: "Invalid token" });
        }
      } else {
        if (payload.id && payload.name) {
          req.body.userTokenData = payload;
          next();
        } else {
          return res.status(401).json({ status: 0, response: "Unauthorized" });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ status: 0, response: `Error in Auth middleware - verifyToken ${error.message}` });
  }
};

