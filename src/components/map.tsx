import React from "react";
import { GoogleMap, LoadScriptNext, CircleF } from "@react-google-maps/api";
import { env } from "~/env.mjs";
import useGeoLocation from "~/hooks/useGeoLocation";
import { useAtomValue } from "jotai";
import { distanceAtom } from "~/pages";

function MyComponent() {
  const { geoPosition } = useGeoLocation();
  const distance = useAtomValue(distanceAtom);

  return geoPosition ? (
    <div className="h-[700px] w-[700px]">
      <LoadScriptNext googleMapsApiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%",
          }}
          center={{
            lat: geoPosition.coords.latitude,
            lng: geoPosition.coords.longitude,
          }}
          zoom={12}
        >
          <CircleF
            center={{
              lat: geoPosition.coords.latitude,
              lng: geoPosition.coords.longitude,
            }}
            options={{
              radius: distance * 1609,
            }}
          />
        </GoogleMap>
      </LoadScriptNext>
    </div>
  ) : (
    <>Loading...</>
  );
}

export default React.memo(MyComponent);
