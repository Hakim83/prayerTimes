import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { TimesData } from '../types/TimesData';
import { YearData } from '../types/YearData';
import { OperationMode } from '../types/OperationMode';
import { FeatureTimes } from '../types/FeatureTimes';

const getCurrentYearDays = () => {
    const year = new Date().getFullYear();
    let date = new Date(year, 0, 1);
    let dates = [];
    while (date.getFullYear() == year) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return dates;
}
const currentYearDays = getCurrentYearDays();
export const getYearData = (coordinates: Coordinates, timeOffset: number, mode: OperationMode) => {
    const dates = currentYearDays;
    const daysData = dates.map(date => {
        return getDateData(date, coordinates, timeOffset);
    })
    let minFeatureTimes: FeatureTimes = {};
    let maxFeatureTimes: FeatureTimes = {};
    let shortestDate, longestDate;
    switch (mode) {
        case "PrayerTimes":
            const earliestFajrDate = daysData.reduce((a, b) => +a.fajr < +b.fajr ? a : b).date;
            const earliestSunriseDate = daysData.reduce((a, b) => +a.sunrise < +b.sunrise ? a : b).date;
            const earliestDhuhrDate = daysData.reduce((a, b) => +a.dhuhr < +b.dhuhr ? a : b).date;
            const earliestAsrDate = daysData.reduce((a, b) => +a.asr < +b.asr ? a : b).date;
            const earliestMaghribDate = daysData.reduce((a, b) => +a.maghrib < +b.maghrib ? a : b).date;
            const earliestIshaDate = daysData.reduce((a, b) => +a.isha < +b.isha ? a : b).date;

            const latestFajrDate = daysData.reduce((a, b) => +a.fajr > +b.fajr ? a : b).date;
            const latestSunriseDate = daysData.reduce((a, b) => +a.sunrise > +b.sunrise ? a : b).date;
            const latestDhuhrDate = daysData.reduce((a, b) => +a.dhuhr > +b.dhuhr ? a : b).date;
            const latestAsrDate = daysData.reduce((a, b) => +a.asr > +b.asr ? a : b).date;
            const latestMaghribDate = daysData.reduce((a, b) => +a.maghrib > +b.maghrib ? a : b).date;
            const latestIshaDate = daysData.reduce((a, b) => +a.isha > +b.isha ? a : b).date;

            minFeatureTimes = {
                fajr: earliestFajrDate, sunrise: earliestSunriseDate, dhuhr: earliestDhuhrDate,
                asr: earliestAsrDate, maghrib: earliestMaghribDate, isha: earliestIshaDate
            };
            maxFeatureTimes = {
                fajr: latestFajrDate, sunrise: latestSunriseDate, dhuhr: latestDhuhrDate,
                asr: latestAsrDate, maghrib: latestMaghribDate, isha: latestIshaDate
            }; break;

        case "FastingTimes":
            shortestDate = daysData.reduce((a, b) => (+a.maghrib - +a.fajr) < (+b.maghrib - +b.fajr) ? a : b).date;
            longestDate = daysData.reduce((a, b) => (+a.maghrib - +a.fajr) > (+b.maghrib - +b.fajr) ? a : b).date;
            minFeatureTimes = { fajr: shortestDate, maghrib: shortestDate };
            maxFeatureTimes = { fajr: longestDate, maghrib: longestDate };
            break;

        case "DayLength":
            shortestDate = daysData.reduce((a, b) => (+a.sunset - +a.sunrise) < (+b.sunset - +b.sunrise) ? a : b).date;
            longestDate = daysData.reduce((a, b) => (+a.sunset - +a.sunrise) > (+b.sunset - +b.sunrise) ? a : b).date;
            minFeatureTimes = { sunrise: shortestDate, sunset: shortestDate };
            maxFeatureTimes = { sunrise: longestDate, sunset: longestDate };
            break;

        default:
            break;
    }
    return new YearData(daysData, minFeatureTimes, maxFeatureTimes);
}

const getDateData = (date: Date, coordinates: Coordinates, timeOffset: number) => {
    const times = new PrayerTimes(coordinates, date, CalculationMethod.MoonsightingCommittee());
    return new TimesData(date, timeOffset, times);
}
