import { Request, Response } from 'express';
import History from '../models/history.model';
import RiceRawData from '../data/raw.json';
import { Standard } from '../models/standard.model';
import { calculateAllMetrics } from '../utils/riceCalculation';

export const getAllHistory = async (req: Request, res: Response) => {
    try {
        const { fromDate, toDate, inspectionID } = req.query;
        let query: any = {};

        if (inspectionID) query.inspectionID = new RegExp(inspectionID as string, 'i');
        if (fromDate && toDate) {
            const start = new Date(fromDate as string);
            const end = new Date(toDate as string);
            end.setHours(23, 59, 59, 999); 

            query.createDate = {
                $gte: start,
                $lte: end
            };
        }

        const data = await History.find(query).sort({ createDate: -1 });
        res.status(200).json({ data });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const getHistoryById = async (req: Request, res: Response) => {
    try {
        const data = await History.findOne({ inspectionID: req.params.id });
        if (!data) return res.status(404).json({ message: "History not found" });
        res.status(200).json(data);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const createHistory = async (req: Request, res: Response) => {
    try {
        const { standardID, name, note, price, samplingPoint, imageLink, grains } = req.body;

        const dataSource = (grains && grains.length > 0) ? grains : RiceRawData.grains;

        const selectedStandard = await Standard.findOne({ id: standardID });
        if (!selectedStandard) {
            return res.status(404).json({ message: "Standard not found" });
        }

        const { composition, defects } = calculateAllMetrics(dataSource, selectedStandard.standardData);

        const fullStandardData = selectedStandard.standardData.map((std: any) => {
            const calculated = composition.find(c => c.key === std.key);
            return {
                ...std.toObject(),
                value: calculated ? calculated.value : 0
            };
        });

        const newHistory = new History({
            name,
            standardID,
            standardName: selectedStandard.name,
            note,
            price,
            samplingPoint,
            imageLink: imageLink || RiceRawData.imageURL,
            samplingDate: new Date(),
            composition: composition,
            defects: defects.map(d => ({ key: d.type, name: d.type, value: d.value })),
            standardData: fullStandardData
        });

        await newHistory.save();
        res.status(200).json(newHistory);

    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

export const patchHistory = async (req: Request, res: Response) => {
    try {
        const updated = await History.findOneAndUpdate(
            { inspectionID: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "History not found" });
        res.status(200).json(updated);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteHistory = async (req: Request, res: Response) => {
    try {
        const { inspectionID }: { inspectionID: string[] } = req.body;
        await History.deleteMany({ inspectionID: { $in: inspectionID } });
        res.status(200).json("Success");
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};