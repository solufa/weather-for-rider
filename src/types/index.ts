export type Location = { longitude: number; latitude: number };

export type Route = {
  distance: number;
  duration: number;
  legs: {
    steps: {
      distance: number;
      duration: number;
      maneuver: { location: [number, number] };
    }[];
  }[];
};
