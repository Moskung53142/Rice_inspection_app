import { Schema, model } from 'mongoose';

const standardSchema = new Schema({
    id: String,
    name: String,
    createDate: Date,
    standardData: [{
        key: String,
        name: String,
        shape: [String],
        maxLength: Number,
        minLength: Number,
        conditionMax: String,
        conditionMin: String
    }]
});

export const Standard = model('Standard', standardSchema);