import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './../models/user.model';
import db from './../config/database.config';

/**
 * Register
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function register(req: Request, res: Response) {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!req.body.username) {
        return res.status(400).send({
            message: "Username can not be empty!",
        });
    }

    if (!req.body.email) {
        return res.status(400).send({
            message: "E-mail can not be empty!",
        });
    }

    if (!emailRegexp.test(req.body.email)) {
        return res.status(400).send({
            message: "E-mail is not vaild!",
        });
    }

    if (!req.body.password) {
        return res.status(400).send({
            message: "Password can not be empty!",
        });
    }

    User.findOne({
        email: req.body.email
    }).exec((err: any, user: any) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }
        else if (user) {
            return res.status(400).send({
                message: "This email already in use!",
            });
        }
        else {
            const user = new User({
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                date: new Date()
            });

            user.save()
                .then(data => {
                    res.status(200).send({
                        message: data
                    });
                }).catch(err => {
                    res.status(500).send({
                        message: `${err.message} || Some error occured while creating the User.`
                    });
                });
        }
    });
};

/**
 * Login
 * @param req Request
 * @param res Response
 * @returns Object
 */
export function login(req: Request, res: Response) {
    if (!req.body.email) {
        return res.status(400).send({
            message: "E-mail can not be empty!",
        });
    }

    if (!req.body.password) {
        return res.status(400).send({
            message: "Password can not be empty!",
        });
    }

    User.findOne({
        email: req.body.email
    }).exec((err: any, user: any) => {
        if (err) {
            return res.status(500).send({
                message: err,
            });
        }

        if (!user) {
            return res.status(404).send({
                message: "E-mail address not found!",
            });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({ id: user.id, username: user.username }, db.secret, {
            expiresIn: 86400
        });

        res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            accessToken: token
        });
    });
};
