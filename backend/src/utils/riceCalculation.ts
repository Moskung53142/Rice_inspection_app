const checkCondition = (value: number, condition: string, target: number) => {
    switch (condition) {
        case 'GT': return value > target;
        case 'GE': return value >= target;
        case 'LT': return value < target;
        case 'LE': return value <= target;
        case 'EQ': return value === target;
        default: return false;
    }
};

export const calculateAllMetrics = (grains: any[], standardData: any[]) => {
    const totalWeight = grains.reduce((sum, g) => sum + g.weight, 0);

    const compositionResults = standardData.map(std => {
        const matched = grains.filter(g => {
            const shapeMatch = std.shape.includes(g.shape);
            const minMatch = checkCondition(g.length, std.conditionMin, std.minLength);
            const maxMatch = checkCondition(g.length, std.conditionMax, std.maxLength);

            return shapeMatch && minMatch && maxMatch;
        });

        const weightSum = matched.reduce((sum, g) => sum + g.weight, 0);
        return {
            key: std.key,
            name: std.name,
            value: Number(((weightSum / totalWeight) * 100).toFixed(2))
        };
    });

    const defectTypes = ['white', 'yellow', 'red', 'damage', 'paddy', 'chalky', 'glutinous'];
    const defectResults = defectTypes.map(type => {
        const matched = grains.filter(g => g.type === type);
        const weightSum = matched.reduce((sum, g) => sum + g.weight, 0);

        return {
            type: type,
            value: Number(((weightSum / totalWeight) * 100).toFixed(2))
        };
    });

    return {
        composition: compositionResults,
        defects: defectResults
    };
};