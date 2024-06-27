import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import type { Map } from 'mapbox-gl';
import { useEffect, useMemo } from 'react';
import type { ControlPosition } from 'react-map-gl';
import type { Location } from 'src/types';

export const useGeocoderControl = ({
  map,
  accessToken,
  position,
  onUpdate,
}: {
  map: Map | null;
  accessToken: string;
  position: ControlPosition;
  onUpdate: (location: Location) => void;
}) => {
  const ctrl = useMemo(() => {
    const ctrl = new MapboxGeocoder({
      marker: false,
      accessToken,
      placeholder: '出発地',
    });

    ctrl.on(
      'result',
      (evt: {
        result?: {
          center?: [number, number];
          geometry?: { type: 'Point'; coordinates: [number, number] };
        };
      }) => {
        const { result } = evt;
        const location =
          result?.center || (result?.geometry?.type === 'Point' && result.geometry.coordinates);

        if (location !== false) {
          onUpdate({ longitude: location[0], latitude: location[1] });
        }
      },
    );

    return ctrl;
  }, [accessToken, onUpdate]);

  useEffect(() => {
    if (!map) return;

    map.addControl(ctrl, position);

    return () => {
      map.removeControl(ctrl);
    };
  }, [ctrl, map, position]);
};
