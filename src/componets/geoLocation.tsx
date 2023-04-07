import { useState } from "react";

const GeoLocation = () => {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoPosition, setGeoPosition] = useState<GeolocationPosition | null>(
    null
  );

  const fetchMe = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPosition(position);
      },
      (error) => {
        setGeoError(error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };
  return (
    <div className="Geolocate">
      <button onClick={fetchMe}>Geolocate</button>
      <h1>Coordinates:</h1>
      <p>Latitude: {geoPosition?.coords.latitude}</p>
      <p>Longitude: {geoPosition?.coords.longitude}</p>
    </div>
  );
};

export default GeoLocation;
