import express, { Request, RequestHandler, Response, NextFunction } from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import db from './config/database.config';

const app = express();
const corsOptions = {
    origin: "*"
};
const port = 3000;

app.use(cors(corsOptions));
app.use(urlencoded({ extended: true }) as RequestHandler);
app.use(json() as RequestHandler);

(<any>mongoose).Promise = global.Promise;
mongoose.connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('Successfully connected to the database.');
}).catch((err: any) => {
    console.log(`Could not connect to the database. Exiting now...`, err);
    process.exit();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

require('./routes/user.route')(app);
require('./routes/sugar.route')(app);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
});
