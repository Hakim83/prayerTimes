import { PrayerTimes } from "adhan";

export class TimesData {
    date: Date;
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    sunset: Date;
    maghrib: Date;
    isha: Date;
    constructor(date: Date, timeOffset: number, times: PrayerTimes) {
        this.date = date;
        this.fajr = this.getTimeLocal(times.fajr, timeOffset);
        this.sunrise = this.getTimeLocal(times.sunrise, timeOffset);
        this.dhuhr = this.getTimeLocal(times.dhuhr, timeOffset);
        this.asr = this.getTimeLocal(times.asr, timeOffset);
        this.sunset = this.getTimeLocal(times.sunset, timeOffset);
        this.maghrib = this.getTimeLocal(times.maghrib, timeOffset);
        this.isha = this.getTimeLocal(times.isha, timeOffset);
    }
    //for dynamic access
    [key: string]: any;

    getTimeLocal = (date: Date, timeOffset: number) => {
        //local time zone (+ve hourse for east of GMT)
        //note also we are interested in time part only
        const currentTimeZone = - (date.getTimezoneOffset() / 60);
        let newDate = new Date(date.setHours(date.getHours() + timeOffset - currentTimeZone));
        return new Date(date.getFullYear(), 0, 1, newDate.getHours(), date.getMinutes());

    }
}
