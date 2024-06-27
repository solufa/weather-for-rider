import { useState } from 'react';
import { MapArea } from 'src/components/MapArea';
import styles from './index.module.css';

const Home = () => {
  const [started, setStarted] = useState(false);

  return (
    <div className={styles.container}>
      <MapArea started={started} />
      {!started && (
        <div className={styles.topCover}>
          <div className={styles.title}>
            <div style={{ fontSize: '120px', fontWeight: 'bold' }}>Weather</div>
            <div className={styles.titleTail}>for Rider</div>
            <button onClick={() => setStarted(true)}>START</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
