export interface IStandardData {
    key?: string;
    minLength?: number;
    maxLength?: number;
    shape: string[];
    name?: string;
    conditionMin?: 'GE' | 'LE' | 'GT' | 'LT' | 'EQ' | 'NE';
    conditionMax?: 'GE' | 'LE' | 'GT' | 'LT' | 'EQ' | 'NE';
    value?: number;
}

export interface IStandard {
    id: string;
    name: string;
    createDate: string;
    standardData: IStandardData[];
}