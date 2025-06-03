import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../generated/prisma';
import { generateAuthToken } from '../utils/authtoken';

import { Request, Response } from 'express';
import { serverErrorMessage, invalidMessage } from '../utils/constants';
import validateSchema from '../utils/validateSchema';


const prisma = new PrismaClient();

// register route
export const register = async (req: Request, res: Response) => {
    // Validate request body
    const requestIsValid = validateSchema(req.body, 'register');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request body." });
        return;
    }

    // Handle the request
    const { email, password, firstName, lastName } = req.body;

    try {
        // Search for an existing user
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "A user with the given email already exists." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword
            }
        });

        const token = generateAuthToken(newUser.id);
        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// login route
export const login = async (req: Request, res: Response) => {
    // Validate request body
    const requestIsValid = validateSchema(req.body, 'login');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request body." });
        return;
    }

    // Handle the request
    const { email, password } = req.body;

    try {
        // Search for the user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: invalidMessage });
            return;
        }

        // Check the password with the stored password hash
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(400).json({ message: invalidMessage });
            return;
        }

        const token = generateAuthToken(user.id);
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}