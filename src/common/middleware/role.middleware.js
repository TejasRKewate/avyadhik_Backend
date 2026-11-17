// =======================================
// ALLOW ROLES
// Usage: allowRoles("admin", "manager")
// Must run AFTER verifyToken (it needs req.user)
// =======================================

export const allowRoles = (...allowedRoles) => {

  return (req, res, next) => {

    try {

      // =======================================
      // CHECK AUTHENTICATED USER
      // =======================================

      if (!req.user) {

        return res.status(401).json({

          success: false,

          message: "Unauthorized: User not found",

        });

      }


      // =======================================
      // NORMALIZE ROLES (avoid case/space mismatch)
      // =======================================

      const userRole = String(req.user.role || "")
        .trim()
        .toUpperCase();

      const normalizedAllowedRoles = allowedRoles.map((role) =>
        String(role).trim().toUpperCase()
      );


      // =======================================
      // CHECK ROLE
      // =======================================

      if (!normalizedAllowedRoles.includes(userRole)) {

        return res.status(403).json({

          success: false,

          message: "Access Denied",

        });

      }


      // =======================================
      // PERMISSION GRANTED
      // =======================================

      next();

    }

    catch (error) {

      console.error("ROLE MIDDLEWARE ERROR:", error);

      return res.status(500).json({

        success: false,

        message: "Role authorization failed",

      });

    }

  };

};