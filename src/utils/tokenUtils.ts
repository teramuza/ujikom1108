import jwt from 'jsonwebtoken';

require('dotenv').config();

export function generateToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY as string);
}

export function verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET_KEY as string);
}
