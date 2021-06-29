import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from './../config/database.config';

/**
 * Very user token
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Object | NextFunction
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    let token: string = req.headers['x-access-token'] as string;

    if (!token) {
        return res.status(403).send({
            message: "No token provided.",
        });
    } else {
        jwt.verify(token, db.secret, (error: any) => {
            if (error) {
                return res.status(403).send({
                    message: "Failure to verify the token.",
                });
            } else {
                next();
            };
        });
    };
};
