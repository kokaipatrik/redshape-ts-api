import mongoose from 'mongoose';

interface UserInterface {
    username: String;
    email: String;
    password: String;
    date: Date;
    lastLoginDate: Date;
}

interface UserModelInterface extends mongoose.Model<UserDoc> {
    build(attr: UserInterface): UserDoc
}

interface UserDoc extends mongoose.Document {}

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    date: Date,
    lastLoginDate: Date,
});

UserSchema.statics.build = (attr: UserInterface) => {
    return new User(attr)
}

const User = mongoose.model<UserDoc, UserModelInterface>('User', UserSchema);

export default User;
