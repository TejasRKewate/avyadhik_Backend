import jwt from "jsonwebtoken";
const secretKey = "tejaskewate"
// Folder is "user" (not "users")
import User from "../../modules/user/user.model.js";


// =======================================
// VERIFY TOKEN
// =======================================

export const verifyToken = async (req, res, next) => {

  try {

    // =======================================
    // GET AUTHORIZATION HEADER
    // =======================================

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

      return res.status(401).json({

        success: false,

        message: "Token Missing",

      });

    }


    // =======================================
    // GET TOKEN
    // =======================================

    const token = authHeader.split(" ")[1];

    if (!token) {

      return res.status(401).json({

        success: false,

        message: "Token Missing",

      });

    }


    // =======================================
    // VERIFY JWT
    // =======================================

    const decoded = jwt.verify(token, secretKey);


    // =======================================
    // GET USER ID
    // =======================================

    const userId = decoded._id || decoded.id || decoded.userId;

    if (!userId) {

      return res.status(401).json({

        success: false,

        message: "User ID not found in token",

      });

    }


    // =======================================
    // FIND USER IN DATABASE
    // The password hash is never kept on req.user
    // =======================================

    const user = await User.findById(userId).select("-password");

    if (!user) {

      return res.status(401).json({

        success: false,

        message: "User not found",

      });

    }


    // =======================================
    // ATTACH USER TO REQUEST
    // =======================================

    req.user = user;

    next();

  }

  catch (err) {

    console.log("AUTH MIDDLEWARE ERROR:", err.message);

    return res.status(401).json({

      success: false,

      message: "Invalid Token",

    });

  }

};