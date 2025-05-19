import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../generated/prisma';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './authMiddleware';


const prisma = new PrismaClient();

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "Unauthorized"})
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userID: string };
        req.userId = decoded.userID;

        // Find the user in the database
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userID
            }
        });

        if (!user) {
            console.log("!! User not found: ", decoded.userID);
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Check the user's role
        if (user.role !== "ADMIN") {
            console.log("!! User is not an admin: ", user.role);
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        
    } catch (err) {
        console.error(err);
        console.log("!! Invalid token");
        res.status(401).json({ message: "Unauthorized" });
    }

    next();
}