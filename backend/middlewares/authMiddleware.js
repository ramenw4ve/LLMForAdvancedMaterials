require('dotenv').config();
const jwt = require("jsonwebtoken");

const authMiddleware = async(req, res, next) => {
      const authToken = req.headers.authorization;
      if(!authToken || !authToken.startsWith("Bearer ")) {
            return res.status(400).json({
                  message: "wrong auth token"
            });
      }
      
      const Token = authToken.split(" ")[1];
      
      try {
            const verifyedToken = await jwt.verify(Token,process.env.JWT_SECRET);
            req.id = verifyedToken.id;
            next();

      }catch (err) {
            console.log(err);
            return res.status(204).json({
                  message: "You are not verifyed"
            });
      }
}

module.exports = authMiddleware;