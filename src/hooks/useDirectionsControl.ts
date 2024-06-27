import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import type { Map } from 'mapbox-gl';
import { useEffect, useMemo } from 'react';
import type { ControlPosition } from 'react-map-gl';
import type { Route } from 'src/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MapboxDirections = require('@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions');

export const useDirectionsControl = ({
  map,
  accessToken,
  started,
  position,
  onUpdate,
}: {
  map: Map | null;
  accessToken: string;
  started: boolean;
  position: ControlPosition;
  onUpdate: (route: Route) => void;
}) => {
  const ctrl = useMemo(() => {
    const ctrl = new MapboxDirections({
      accessToken,
      profile: 'mapbox/driving',
      steps: true,
      language: 'ja',
      controls: { instructions: false },
      placeholderOrigin: '出発地',
      placeholderDestination: '目的地',
    });

    ctrl.on(
      'origin',
      (evt: { feature: { geometry: { coordinates: [number, number]; type: 'Point' } } }) => {
        console.log('origin', evt.feature.geometry.coordinates);
      },
    );

    ctrl.on(
      'destination',
      (evt: { feature: { geometry: { coordinates: [number, number]; type: 'Point' } } }) => {
        console.log('destination', evt);
      },
    );

    ctrl.on('route', (evt: { route: Route[] }) => {
      onUpdate(evt.route[0]);
    });

    ctrl.on(
      'profile',
      (evt: { profile: `mapbox/${'driving-traffic' | 'driving' | 'walking' | 'cycling'}` }) => {
        console.log('profile', evt);
      },
    );

    ctrl.on('clear', (evt: { type: 'origin' | 'destination' }) => {
      console.log('clear', evt);
    });

    return ctrl;
  }, [accessToken, onUpdate]);

  useEffect(() => {
    if (!map || !started) return;

    map.addControl(ctrl, position);

    return () => {
      map.removeControl(ctrl);
    };
  }, [ctrl, map, position, started]);
};
