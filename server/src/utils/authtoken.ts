import jwt from 'jsonwebtoken';


export const generateAuthToken = (userID: string): string => {
    const secret = process.env.JWT_SECRET as string;
    return jwt.sign({ userID }, secret, { expiresIn: '7d'})
}

export const verifyAuthToken = (token: string): string => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userID: string };
    return decoded.userID;
}