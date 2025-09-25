import jwt from "jsonwebtoken"

export const generateToken = async (res, user, message) => {
    console.log(user)
    const token = jwt.sign({ userId: user._id ,role:user.role}, process.env.SECRET_KEY, { expiresIn: "7d" });
    res.status(200)
        .cookie("token", token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000  //1 day
        }).json({
            success: true,
            message,
            user 
        });
}