import { Request, Response } from 'express';
import { Standard } from '../models/standard.model';

export const getStandards = async (req: Request, res: Response) => {
    try {
        const data = await Standard.find({}, 'id name standardName'); 
        res.status(200).json({ data });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};