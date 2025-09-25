import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const isAuthenticated = async(req, res, next) => {
    

    try {
        const token= req.cookies.token || req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({
                success: false,
                message: "User are not authenticated"
            })
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if(!decoded){
            return res.status(401).json({
                success: false,
                message: "unauthorized  access denied"
            });
        }
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.log("userr not found")
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        req.id = decoded.userId;
        req.role = user.role;
       
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        
    }
}

export default isAuthenticated;