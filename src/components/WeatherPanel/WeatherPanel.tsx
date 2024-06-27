import styles from './WeatherPanel.module.css';

export const WeatherPanel = (props: { time: string; text: string }) => {
  return (
    <div className={styles.panel}>
      <div className={styles.time}>{props.time}</div>
      <div className={styles.text}>{props.text}</div>
    </div>
  );
};
