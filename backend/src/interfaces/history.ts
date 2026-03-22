import type { IStandardData } from "./standard";

export interface History {
    name?: string;
    createDate?: Date;
    inspectionID: string;
    standardID?: string;
    note?: string;
    standardName?: string;
    samplingDate?: Date;
    samplingPoint?: string[];
    price?: number;
    imageLink?: string;
    standardData: IStandardData[];
}