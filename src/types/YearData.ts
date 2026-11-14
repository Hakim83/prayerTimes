import { FeatureTimes } from "./FeatureTimes";
import { TimesData } from "./TimesData";

export class YearData {
    timesData: TimesData[];
    minFeatureTimes: FeatureTimes;
    maxFeatureTimes: FeatureTimes;
    constructor(timesData: TimesData[], minFeatureTimes: FeatureTimes, maxFeatureTimes: FeatureTimes) {
        this.timesData = timesData;
        this.minFeatureTimes = minFeatureTimes;
        this.maxFeatureTimes = maxFeatureTimes;
    }
}