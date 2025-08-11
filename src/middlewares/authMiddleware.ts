import {Request, Response, NextFunction, RequestHandler} from 'express';
import jwt from 'jsonwebtoken';
import ErrorCodes from "@constants/ErrorCodes";
import {TRole} from "@constants/User";

interface AuthPayload {
    sub: string; // user.id
    who: TRole; // user.role
    // you can add more if needed
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: TRole;
            };
        }
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

        return res.status(401).json({
            code: ErrorCodes.AUTH_UNAUTHORIZED_USER,
            message: 'Missing or invalid Authorization header',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as AuthPayload;

        req.user = {
            id: decoded.sub,
            role: decoded.who,
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            code: ErrorCodes.AUTH_UNAUTHORIZED_USER,
            message: 'Invalid or expired token',
        });
    }
}

export default authMiddleware;
