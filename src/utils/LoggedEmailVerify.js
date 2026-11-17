const LoggedverifyEmailTemplate = ({ name, otp }) => {
    return `
<p>Dear ${name}</p>    
<p>Thank you for registering Avyadhik.</p>   
<p>Your OTP ${otp}</p>
`
}

export default LoggedverifyEmailTemplate