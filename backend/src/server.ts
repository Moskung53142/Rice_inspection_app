import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import historyRoutes from './routes/history.routes';
import standardRoutes from './routes/standard.routes'
import { Standard } from './models/standard.model';
import initialStandards from './data/standard.json';

dotenv.config();

const seedStandards = async () => {
    try {
        const count = await Standard.countDocuments();
        if (count === 0) {
            const dataToSeed = initialStandards.map((std: any) => ({
                ...std,
                createDate: new Date(std.createDate)
            }));

            await Standard.insertMany(dataToSeed);
            console.log('Standard data seeded successfully!');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rice_db';

mongoose.connect(mongoURI)
    .then(() => {
        seedStandards();
        console.log('Connected to MongoDB')
    })
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req: Request, res: Response) => {
    res.send('Rice inspection API is running');
});

app.use('/history', historyRoutes);
app.use('/standard', standardRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});