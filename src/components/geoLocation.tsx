import useGeoLocation from "~/hooks/useGeoLocation";

const GeoLocation = () => {
  const { fetch, geoPosition } = useGeoLocation();

  return (
    <div className="p-6">
      <div className="Geolocate block w-auto rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500">
        <button onClick={() => fetch()}>Geolocate Me!</button>
        <h1>Coordinates:</h1>
        <p>Latitude: {geoPosition?.coords.latitude}</p>
        <p>Longitude: {geoPosition?.coords.longitude}</p>
      </div>
    </div>
  );
};

export default GeoLocation;
