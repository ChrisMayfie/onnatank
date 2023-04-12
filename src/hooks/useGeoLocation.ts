import { atom, useAtom } from "jotai";

const geoErrorAtom = atom<string | null>(null);
const geoPositionAtom = atom<GeolocationPosition | null>(null);

const useGeoLocation = () => {
  const [geoError, setGeoError] = useAtom(geoErrorAtom);
  const [geoPosition, setGeoPosition] = useAtom(geoPositionAtom);

  const fetch = () =>
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPosition(position);
      },
      (error) => {
        setGeoError(error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

  return { fetch, geoPosition, geoError };
};

export default useGeoLocation;
