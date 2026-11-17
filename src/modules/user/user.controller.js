import * as userService from "./user.service.js";
import User from './user.model.js'
import { generateOTP } from "../../utils/generateOtp.js";
import { sendEmail } from "../../utils/sendEmail.js";
import forgetPasswordTemplate from "../../utils/forgetPasswordTemplate.js";
import bcrypt from 'bcryptjs'
import LoggedverifyEmailTemplate from "../../utils/LoggedEmailVerify.js";

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

// export const verifyEmail = async (req, res) => {
//   try {
//     const { email } = req.body

//     const user = await User.findOne({ email })
//     if (!user) {
//       return res.status(400).json({
//         message: "user not exists"
//       })
//     }

//     const updateUser = await User.updateOne({ _id: code }, {
//       isVerified: true
//     })
//     return res.status(200).json({
//       message: "Verification link sent on your email"
//     })
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message
//     })
//   }
// }

export const verifyEmail = async (req, res) => {

  try {
    const userId = req?.user
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "user not exsits"
      })
    }

    if (user.isVerified == false) {
      return res.json({
        message: "Please verify your email"
      })
    }

    const otp = generateOTP()
    const expireTime = new Date(Date.now() + 60 * 60 * 1000)

    const update = await User.findByIdAndUpdate(user._id, {
      verificationOtp: otp,
      verificationOtpExpiry: new Date(expireTime).toISOString()
    })

    await sendEmail({
      sendTo: email,
      subject: "Forget Password",
      html: LoggedverifyEmailTemplate({
        name: user.name, otp
      })
    })
    return res.status(200).json({
      message: "Opt sent sucessfully",

    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: error.message
    })
  }
}

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({
        message: "Provide email"
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "Provide email"
      })
    }

    const otp = generateOTP()
    const expireTime = new Date(Date.now() + 60 * 60 * 1000)

    const update = await User.findByIdAndUpdate(user._id, {
      forgetPasswordOtp: otp,
      forgetPasswordOtpExpiry: new Date(expireTime).toISOString()
    })

    await sendEmail({
      sendTo: email,
      subject: "Forget Password",
      html: forgetPasswordTemplate({
        name: user.name, otp
      })
    })

    return res.status(200).json({
      message: "Opt sent sucessfully",

    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: "Email not found",
        success: false
      })
    }

    const currentTime = new Date().toISOString()
    console.log(currentTime)
    if (user.forgetPasswordOtpExpiry < currentTime) {
      return res.status(400).json({
        message: "Otp is expire",
        success: false
      })
    }

    if (otp !== user.forgetPasswordOtp) {
      return res.status(400).json({
        message: "Invalid Otp",
        success: false
      })
    }

    // const update = await userModel.updateMany({ _id: user._id }, {
    //     forget_password_otp: null,
    //     forget_password_expiry: null
    // })


    return res.json({
      message: "OTP verified suuccessful",
      success: true
    })


  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false
    })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "password does not match"
      })
    }

    const hashPassword = await bcrypt.hash(newPassword, 10)

    const update = await User.findOneAndUpdate(user._id, {
      password: hashPassword
    })

    return res.json({
      message: "password update successfully",
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,

    })
  }
}