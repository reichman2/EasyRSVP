import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "Unauthorized"})
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userID: string };
        req.userId = decoded.userID;
    } catch (err) {
        console.error(err);
        console.log("!! Invalid token");
        res.status(401).json({ message: "Unauthorized" });
    }

    next();
}