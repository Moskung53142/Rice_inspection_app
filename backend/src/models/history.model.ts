import { Schema, model, Document } from 'mongoose';
import { Counter } from './counter.model';

export interface IHistory extends Document {
    name: string;
    createDate: Date;
    inspectionID: string;
    standardID: string;
    note: string;
    standardName: string;
    samplingDate: Date;
    samplingPoint: string[];
    price: number;
    imageLink: string;

    standardData: Array<{
        key: string;
        minLength?: number;
        maxLength?: number;
        shape: string[];
        name: string;
        conditionMin?: string;
        conditionMax?: string;
        value: number;
    }>;

    composition: Array<{
        key: string;
        name: string;
        value: number;
    }>;

    defects: Array<{
        key: string;
        name: string;
        value: number;
    }>;
}

const historySchema = new Schema<IHistory>({
    name: String,
    createDate: { type: Date, default: Date.now },
    inspectionID: { type: String, unique: true },
    standardID: String,
    note: String,
    standardName: String,
    samplingDate: Date,
    samplingPoint: [String],
    price: Number,
    imageLink: String,
    standardData: [{
        key: String,
        minLength: Number,
        maxLength: Number,
        shape: [String],
        name: String,
        conditionMin: { type: String, enum: ['GE', 'LE', 'GT', 'LT', 'EQ', 'NE'] },
        conditionMax: { type: String, enum: ['GE', 'LE', 'GT', 'LT', 'EQ', 'NE'] },
        value: { type: Number, default: 0 }
    }],

    composition: [{
        key: String,
        name: String,
        value: { type: Number, default: 0 }
    }],

    defects: [{
        key: String,
        name: String,
        value: { type: Number, default: 0 }
    }],
}, {
    timestamps: true
});

historySchema.pre<IHistory>('save', async function () {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { id: 'inspectionID' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        if (counter) {
            this.inspectionID = `ES_${counter.seq.toString().padStart(3, '0')}`;
        }
    }
});

export default model<IHistory>('History', historySchema);