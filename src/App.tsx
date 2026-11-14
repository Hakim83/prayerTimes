import { createSignal, type Component, JSX, createEffect, Show, Switch, Match } from 'solid-js';
import { Autocomplete, CityInfo } from "./components/autocomplete/autocomplete";
import "./services/prayerTimes";
import { Coordinates } from 'adhan';
import { getYearData } from './services/prayerTimes';
import LineChart from './components/lineChart/lineChart';
import PrayerCard from './components/prayerCard/PrayerCard';
import { YearData } from './types/YearData';
import { FeatureTimes } from './types/FeatureTimes';
import { OperationMode } from './types/OperationMode';
import styles from './App.module.css';

const [coordinates, setCoordinates] = createSignal<Coordinates>();
const [timeZone, setTimeZone] = createSignal<number>();
const [yearData, setYearData] = createSignal<YearData>();

const [minData, setMinData] = createSignal<FeatureTimes>();
const [maxData, setMaxData] = createSignal<FeatureTimes>();

const [operationMode, setOperationMode] = createSignal<OperationMode>("PrayerTimes");

const App: Component = () => {

  const canUpdateGraph: () => boolean = () => !!coordinates() && !!timeZone();

  const updateZone = (newVal: string) => {
    const oldVal = timeZone();
    const regex = /^[-+]?\d+(\.\d+)?$/;
    if (regex.test(newVal)) {
      const num = Number(newVal);
      if (num >= -12 && num <= 14) {
        setTimeZone(num);
        return;
      }
    }
    //invalid valid, reset
    alert("invalid time zone offset, insert a valid number");
    setTimeZone(timeZone());
  }

  const UpdateCityInfo = (info: CityInfo) => {
    setTimeZone(info.timeOffset);
    setCoordinates(new Coordinates(info.lat, info.lng));
    console.log(`city info updated: ${info.cityDescription}, lat: ${info.lat}, lng: ${info.lng}, time zone: ${info.timeOffset}`);
  }

  const updateGraph = () => {
    const data = getYearData(coordinates()!, timeZone()!, operationMode());
    setYearData(data);
    setMinData(data.minFeatureTimes);
    setMaxData(data.maxFeatureTimes);
  }

  // Auto-update graph when location is selected and timezone is available
  createEffect(() => {
    if (canUpdateGraph()) {
      updateGraph();
    }
  });

  const formatPeriod = (t1: Date, t2: Date) => {
    const sec = Math.floor((+t1 - +t2) / 1000);
    return `${Math.floor(sec / 3600)} hr, ${sec % 60} min`;
  }

  const getTodayTimes = () => {
    if (!yearData()) return undefined;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return yearData()?.timesData.find(td => td.date.toISOString().split('T')[0] === todayStr);
  }

  const formatTime = (date: Date | undefined) => {
    return date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) || '-';
  }

  const formatDate = (date: Date | undefined) => {
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '-';
  }
  return (
    <div class="m-3">
      <div class="row mb-4">
        <Autocomplete selectionUpdated={UpdateCityInfo}></Autocomplete>
        <div class="col-auto mt-1">
          <label class="form-label align-middle">Select Time Zone</label>
        </div>
        <div class="col-auto">
          <input class="form-control" type="text" value={timeZone() || ""} onchange={e => updateZone(e.currentTarget.value)} />
        </div>
        <div class="col-2 d-grid">
          <button class="btn btn-primary" onClick={updateGraph} disabled={!canUpdateGraph()}>Update</button>
        </div>
      </div>
      <div class="row">
        <label id="result"></label>
      </div>
      <div class="row g-3 g-lg-3 g-md-2 g-sm-1" style="min-height: 100vh;">
        <Show when={yearData()}>
          {/* Chart Section */}
          <div class="col-lg-9 col-12">
            <LineChart data={yearData()} operationMode={operationMode()} />
          </div>
          
          {/* Prayer Times Cards Section */}
          <Show when={maxData() && minData()}>
            <Switch>
              <Match when={operationMode() == "PrayerTimes"}>
                <div class="col-lg-3 col-12">
                  <h6 class="mb-2 small">Prayer Times</h6>
                  <div class="row g-1">
                    <PrayerCard 
                      prayerName="Fajr" 
                      prayerType="fajr"
                      todayTime={formatTime(getTodayTimes()?.fajr)}
                      latestTime={formatTime(yearData()?.timesData.find(td=> td.date == maxData()?.fajr)?.fajr)}
                      latestDate={formatDate(maxData()?.fajr)}
                      earliestTime={formatTime(yearData()?.timesData.find(td=> td.date == minData()?.fajr)?.fajr)}
                      earliestDate={formatDate(minData()?.fajr)}
                    />
                    <PrayerCard 
                      prayerName="Sunrise" 
                      prayerType="sunrise"
                      todayTime={formatTime(getTodayTimes()?.sunrise)}
                      latestTime={formatTime(yearData()?.timesData.find(td=> td.date == maxData()?.sunrise)?.sunrise)}
                      latestDate={formatDate(maxData()?.sunrise)}
                      earliestTime={formatTime(yearData()?.timesData.find(td=> td.date == minData()?.sunrise)?.sunrise)}
                      earliestDate={formatDate(minData()?.sunrise)}
                    />
                    <PrayerCard 
                      prayerName="Dhuhr" 
                      prayerType="dhuhr"
                      todayTime={formatTime(getTodayTimes()?.dhuhr)}
                      latestTime={formatTime(yearData()?.timesData.find(td=> td.date == maxData()?.dhuhr)?.dhuhr)}
                      latestDate={formatDate(maxData()?.dhuhr)}
                      earliestTime={formatTime(yearData()?.timesData.find(td=> td.date == minData()?.dhuhr)?.dhuhr)}
                      earliestDate={formatDate(minData()?.dhuhr)}
                    />
                    <PrayerCard 
                      prayerName="Asr" 
                      prayerType="asr"
                      todayTime={formatTime(getTodayTimes()?.asr)}
                      latestTime={formatTime(yearData()?.timesData.find(td=> td.date == maxData()?.asr)?.asr)}
                      latestDate={formatDate(maxData()?.asr)}
                      earliestTime={formatTime(yearData()?.timesData.find(td=> td.date == minData()?.asr)?.asr)}
                      earliestDate={formatDate(minData()?.asr)}
                    />
                    <PrayerCard 
                      prayerName="Maghrib" 
                      prayerType="maghrib"
                      todayTime={formatTime(getTodayTimes()?.maghrib)}
                      latestTime={formatTime(yearData()?.timesData.find(td=> td.date == maxData()?.maghrib)?.maghrib)}
                      latestDate={formatDate(maxData()?.maghrib)}
                      earliestTime={formatTime(yearData()?.timesData.find(td=> td.date == minData()?.maghrib)?.maghrib)}
                      earliestDate={formatDate(minData()?.maghrib)}
                    />
                    <PrayerCard 
                      prayerName="Isha" 
                      prayerType="isha"
                      todayTime={formatTime(getTodayTimes()?.isha)}
                      latestTime={formatTime(yearData()?.timesData.find(td=> td.date == maxData()?.isha)?.isha)}
                      latestDate={formatDate(maxData()?.isha)}
                      earliestTime={formatTime(yearData()?.timesData.find(td=> td.date == minData()?.isha)?.isha)}
                      earliestDate={formatDate(minData()?.isha)}
                    />
                  </div>
                </div>
              </Match>
              <Match when={operationMode() == "DayLength"}>
                <div class="col-lg-3 col-12" style="background: #f8f9fa; padding: '1rem'; border-radius: '0.5rem';">
                  <h6 class="mb-3">Day Length</h6>
                  <div class="mb-3">
                    <small class="text-muted d-block">Longest period</small>
                    <div style="font-weight: 600;">{formatPeriod(maxData()?.sunset!, maxData()?.sunrise!)}</div>
                    <small style="color: #0066cc;">{maxData()?.sunrise?.toLocaleDateString()}</small>
                  </div>
                  <div>
                    <small class="text-muted d-block">Shortest period</small>
                    <div style="font-weight: 600;">{formatPeriod(minData()?.sunset!, minData()?.sunrise!)}</div>
                    <small style="color: #dc3545;">{minData()?.sunrise?.toLocaleDateString()}</small>
                  </div>
                </div>
              </Match>
              <Match when={operationMode() == "FastingTimes"}>
                <div class="col-lg-3 col-12" style="background: #f8f9fa; padding: '1rem'; border-radius: '0.5rem';">
                  <h6 class="mb-3">Fasting Times</h6>
                  <div class="mb-3">
                    <small class="text-muted d-block">Longest period</small>
                    <div style="font-weight: 600;">{formatPeriod(maxData()?.maghrib!, maxData()?.fajr!)}</div>
                    <small style="color: #0066cc;">{maxData()?.fajr?.toLocaleDateString()}</small>
                  </div>
                  <div>
                    <small class="text-muted d-block">Shortest period</small>
                    <div style="font-weight: 600;">{formatPeriod(minData()?.maghrib!, minData()?.fajr!)}</div>
                    <small style="color: #dc3545;">{minData()?.fajr?.toLocaleDateString()}</small>
                  </div>
                </div>
              </Match>
            </Switch>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default App;
