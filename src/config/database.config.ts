import dotenv from 'dotenv';
dotenv.config();

export default {
    url: process.env.MONGO_URI || 'mongodb://mongo:27017/redshape',
    secret: process.env.SECRET_KEY || 'redshape-secret-key'
};
