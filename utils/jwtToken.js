export const generateToken = (user,message, statusCode,res)=> {
    const token =user.generateJsonWebToken();
    const cookiename = user.role === "Admin" ? "adminToken" : "patientToken";
    res.status(statusCode).cookie(cookiename, token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 *60 *1000),
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }).json({ 
        success: true,
        message,
        user,
        token,
    });
};