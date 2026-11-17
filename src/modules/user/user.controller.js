import * as userService from "./user.service.js";
import User from './user.model.js'

// =======================================
// ERROR HANDLER
// Service errors carry a statusCode
// (409 duplicate email, 401 wrong login, ...).
// Anything else is an unexpected 500.
// =======================================

const handleError = (res, err, label) => {

  if (err.statusCode) {

    return res.status(err.statusCode).json({

      success: false,

      message: err.message,

    });

  }

  console.error(`${label} ERROR:`, err);

  return res.status(500).json({

    success: false,

    message: "Something went wrong",

  });

};


// =======================================
// REGISTER (FR-1)
// POST /register  (public)
// Body: name, email, phone, password, role (user | vendor)
// =======================================

export const registerUser = async (req, res) => {

  try {

    const { user, token } = await userService.registerUser(req.body);

    return res.status(201).json({

      success: true,

      message: "Registered successfully",

      data: { user, token },

    });

  }

  catch (err) {

    return handleError(res, err, "REGISTER");

  }

};


// =======================================
// LOGIN (FR-2)
// POST /login  (public)
// Body: email, password
// =======================================

export const loginUser = async (req, res) => {

  try {

    const { user, token } = await userService.loginUser(req.body);

    return res.status(200).json({

      success: true,

      message: "Login successful",

      data: { user, token },

    });

  }

  catch (err) {

    return handleError(res, err, "LOGIN");

  }

};


// =======================================
// CREATE STAFF (FR-4)
// POST /staff  (admin only)
// Body: name, email, phone, password, role (admin | manager | viewer)
// =======================================

export const createStaff = async (req, res) => {

  try {

    const user = await userService.createStaff(req.body);

    return res.status(201).json({

      success: true,

      message: "Staff account created",

      data: { user },

    });

  }

  catch (err) {

    return handleError(res, err, "CREATE STAFF");

  }

};


export const getMe = async (req, res) => {
  try {
    const user = req?.user

    const getMe = await User.findById(user)
    if (!getMe) {
      return res.status(400).json({
        message: "user not fonnd"
      })
    }

    return res.status(201).json({
      data: getMe
    })

    console.log(getMe)
  } catch (error) {
    console.log(error.message)
  }
}

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body

    const user = await User.findOne({ _id: code })
    if (!user) {
      return res.status(400).json({
        message: "user not exists"
      })
    }

    const updateUser = await User.updateOne({ _id: code }, {
      isVerified: true
    })
    return res.status(200).json({
      message: "Verification link sent on your email"
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

// export const checkEmail = async (req, res) => {
//   try {
//     const { email, code } = req.body

//     const user = await findOne({ email })
//     if (!user) {
//       return res.status(400).json({
//         message: "user not exists"
//       })
//     }

//     if (code !== user._id) {
//       return res.status(400).json({
//         message:"verification failed"
//       })
//     }

//   } catch (error) {
//     return res.status(500).json({
//       message: error.message
//     })
//   }
// }