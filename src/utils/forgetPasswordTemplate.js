const forgetPasswordTemplate = ({ name, otp }) => {
    return `
<p>Dear ${name}</p>    
<p>Thank you for registering Avyadhik.</p>   
<span  style="color:black;background :orange;margin-top : 10px,padding:20px,display:block">
    ${otp}
</span>
`
}

export default forgetPasswordTemplate