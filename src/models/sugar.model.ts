import mongoose from 'mongoose';

interface SugarInterface {
    meal: Boolean;
    mealCategory: Number;
    value: Array<any>;
    user: String;
    createdAt: Date;
    updatedAt: Date;
}

interface SugarModelInterface extends mongoose.Model<SugarDoc> {
    build(attr: SugarInterface): SugarDoc
}

interface SugarDoc extends mongoose.Document {}

const SugarSchema = new mongoose.Schema({
    meal: Boolean,
    mealCategory: Number,
    value: [],
    user: String,
    createdAt: Date,
    updatedAt: Date,
});

SugarSchema.statics.build = (attr: SugarInterface) => {
    return new Sugar(attr)
}

const Sugar = mongoose.model<SugarDoc, SugarModelInterface>('Sugar', SugarSchema);

export default Sugar;
