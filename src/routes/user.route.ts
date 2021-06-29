import { Application } from 'express';
import { register, login } from './../controllers/user.controller';

module.exports = (app: Application) => {
    app.post('/register', register);
    app.post('/login', login);
};
