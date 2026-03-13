import jwt from "jsonwebtoken"

export const generateToken = async (res, user, message) => {
    const effectiveRole = user?.activeRole || user?.role;
    const token = jwt.sign({ userId: user._id, role: effectiveRole }, process.env.SECRET_KEY, { expiresIn: "7d" });

    const safeUser = user?.toObject ? user.toObject() : user;
    if (safeUser && typeof safeUser === 'object') {
        delete safeUser.password;
    }
    res.status(200)
        .cookie("token", token, {
            httpOnly: true,
            sameSite: 'None',
            secure: true,
            maxAge: 24 * 60 * 60 * 1000  //1 day
        }).json({
            success: true,
            message,
            user: safeUser
        });
}