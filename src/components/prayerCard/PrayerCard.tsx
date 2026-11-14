import { Component } from 'solid-js';
import styles from '../../App.module.css';

interface PrayerCardProps {
  prayerName: string;
  prayerType: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  todayTime: string;
  latestTime: string;
  latestDate: string;
  earliestTime: string;
  earliestDate: string;
}

const PrayerCard: Component<PrayerCardProps> = (props) => {
  return (
    <div class="col-lg-6 col-6">
      <div class={`${styles['prayer-card']} ${styles[props.prayerType]} p-2 small`}>
        <div class="fw-bold mb-1 small">{props.prayerName}</div>
        
        <small class="text-muted d-block">Today</small>
        <div class="mb-2">{props.todayTime}</div>
        
        <small class="text-muted d-block">Latest</small>
        <div class={`mb-1 ${styles['text-primary-blue']}`}>{props.latestTime}</div>
        <small>{props.latestDate}</small>
        
        <small class="text-muted d-block mt-2">Earliest</small>
        <div class={styles['text-danger-red']}>{props.earliestTime}</div>
        <small>{props.earliestDate}</small>
      </div>
    </div>
  );
};

export default PrayerCard;

