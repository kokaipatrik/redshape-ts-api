import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from './../config/database.config';
import Sugar from './../models/sugar.model';

/**
 * User permission check
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Object | NextFunction
 */
export function userPermission(req: Request, res: Response, next: NextFunction) {
    Sugar.findById(req.params.sugarid)
    .then((data : any) => {
        const sugarUser = data.user;
        const token: string = req.headers['x-access-token'] as string;
        const currentUser : any = jwt.verify(token, db.secret);

        if (sugarUser != currentUser.id) {
            res.status(401).send({
                message: 'Access denied.',
            });
        }
        else {
            next();
        }
    }).catch((err : any) => {
        return res.status(500).send({
            message: `${err.message} || Error retrieving sugar with id ${req.params.sugarid}`
        });
    });
};

/**
 * Duplicated sugar value type check
 * @param req Request
 * @param res Response
 * @param next NextFunction
 * @returns Object | NextFunction
 */
export function duplicatedSugarValueType(req: Request, res: Response, next: NextFunction) {
    Sugar.findById(req.params.sugarid)
    .then((data: any) => {
        const values = data.value;
        const beforeAfter = req.body.beforeAfter == 0 ? 'before' : 'after';

        if (values.some((value: any) => value.type === beforeAfter)) {
            res.status(400).send({
                message: `This Sugar object already has '${beforeAfter}' value!`,
            });
        }
        else {
            next();
        }
    }).catch((err: any) => {
        return res.status(500).send({
            message: `${err.message} || Error retrieving sugar with id ${req.params.sugarid}`
        });
    });
};
