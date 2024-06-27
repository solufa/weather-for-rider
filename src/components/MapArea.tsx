import axios from 'axios';
import type { Map as GlMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import { useDirectionsControl } from 'src/hooks/useDirectionsControl';
import type { Location, Route } from 'src/types';
import { WeatherPanel } from './WeatherPanel/WeatherPanel';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
const MAP_STYLE = process.env.NEXT_PUBLIC_MAPBOX_STYLE ?? '';
const WEATHER_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY ?? '';

type GeoRes = {
  features: {
    place_type: ('locality' | 'place' | 'region' | 'country')[];
    text_ja: string;
  }[];
};

type Weather = {
  dt: number;
  main: { temp: number };
  weather: { main: string; description: string }[];
};

type Forecast = {
  list: Weather[];
};

type MarkerProps = {
  longitude: number;
  latitude: number;
  time: string;
  text: string;
};

export const MapArea = (props: { started: boolean }) => {
  const [map, setMap] = useState<GlMap | null>(null);
  const [markers, setMarkers] = useState<MarkerProps[]>([]);
  const [viewState, setViewState] = useState({
    longitude: 139.7206055,
    latitude: 35.778509,
    zoom: 16,
  });
  const fetchMarker = useCallback(
    async ({
      location,
      timestamp,
      isOrigin,
    }: {
      location: Location;
      timestamp: number;
      isOrigin: boolean;
    }): Promise<MarkerProps | void> => {
      const geo = await axios.get<GeoRes>(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.longitude},${location.latitude}.json?language=ja&access_token=${TOKEN}`,
      );

      if (
        !geo.data.features.some((f) => f.place_type.includes('country') && f.text_ja === '日本')
      ) {
        return;
      }

      const target = isOrigin
        ? await axios
            .get<Weather>(
              `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${WEATHER_KEY}&units=metric&lang=ja`,
            )
            .then(({ data }) => data)
        : await axios
            .get<Forecast>(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${WEATHER_KEY}&units=metric&lang=ja`,
            )
            .then(
              ({ data }) =>
                data.list.filter((val) => timestamp + 3 * 3600 * 1000 > val.dt * 1000)[0],
            );

      const place =
        geo.data.features.find((f) => f.place_type.includes('locality')) ??
        geo.data.features.filter((f) => f.place_type.includes('place'))[0];

      return {
        ...location,
        time: `${new Date(timestamp).toLocaleString().slice(2, -3)}${
          isOrigin ? '現在の天候' : '到着時の予報'
        }`,
        text: `【${geo.data.features.filter((f) => f.place_type.includes('region'))[0].text_ja}${
          place.text_ja
        }】${target.main.temp}℃/${target.weather[0].description}`,
      };
    },
    [],
  );
  const onUpdate = useCallback(
    async (route: Route) => {
      setMarkers([]);

      const origin = route.legs[0].steps[0];
      const destination = route.legs[0].steps.slice(-1)[0];
      const results = await Promise.all([
        fetchMarker({
          location: {
            longitude: origin.maneuver.location[0],
            latitude: origin.maneuver.location[1],
          },
          timestamp: Date.now(),
          isOrigin: true,
        }),
        fetchMarker({
          location: {
            longitude: destination.maneuver.location[0],
            latitude: destination.maneuver.location[1],
          },
          timestamp: Date.now() + route.duration * 1000,
          isOrigin: false,
        }),
      ]).then((rs) => rs.filter((r): r is MarkerProps => !!r));

      if (results.length < 2) return;

      setMarkers(results);
    },
    [fetchMarker],
  );
  useDirectionsControl({
    map,
    accessToken: TOKEN,
    started: props.started,
    position: 'top-left',
    onUpdate,
  });

  return (
    <Map
      initialViewState={viewState}
      mapStyle={MAP_STYLE}
      mapboxAccessToken={TOKEN}
      onZoomEnd={(e) => setViewState({ ...viewState, zoom: e.viewState.zoom })}
      onStyleData={(e) => setMap(e.target)}
    >
      {markers.map((m, i) => (
        <Marker key={i} longitude={m.longitude} latitude={m.latitude}>
          <WeatherPanel time={m.time} text={m.text} />
        </Marker>
      ))}
    </Map>
  );
};
