import { useState, memo } from "react";
import {
  GoogleMap,
  LoadScriptNext,
  CircleF,
  StandaloneSearchBox,
  MarkerF,
} from "@react-google-maps/api";
import { env } from "~/env.mjs";
import useGeoLocation from "~/hooks/useGeoLocation";
import { useAtomValue } from "jotai";
import { distanceAtom } from "~/pages";

function MyComponent() {
  const { geoPosition } = useGeoLocation();
  const distance = useAtomValue(distanceAtom);

  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const [places, setPlaces] = useState<
    google.maps.places.PlaceResult[] | undefined
  >(undefined);

  return geoPosition ? (
    <>
      <div className="h-[700px] w-[700px]">
        <LoadScriptNext
          googleMapsApiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
          channel="weekly"
        >
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            center={{
              lat: geoPosition.coords.latitude,
              lng: geoPosition.coords.longitude,
            }}
            zoom={10}
          >
            <StandaloneSearchBox
              onLoad={(standalone) => {
                setSearchBox(standalone);
              }}
              onPlacesChanged={() => {
                setPlaces(searchBox?.getPlaces());
              }}
            >
              <input
                type="text"
                placeholder="Customized your placeholder"
                style={{
                  boxSizing: `border-box`,
                  border: `1px solid transparent`,
                  width: `240px`,
                  height: `32px`,
                  padding: `0 12px`,
                  borderRadius: `3px`,
                  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                  fontSize: `14px`,
                  outline: `none`,
                  textOverflow: `ellipses`,
                  position: "absolute",
                  left: "50%",
                  marginLeft: "-120px",
                }}
              />
            </StandaloneSearchBox>

            {places?.map((place) => (
              <MarkerF
                key={place.name}
                position={{
                  lat: place.geometry?.location?.lat() ?? 0,
                  lng: place.geometry?.location?.lng() ?? 0,
                }}
              />
            ))}

            <MarkerF
              position={{
                lat: geoPosition.coords.latitude,
                lng: geoPosition.coords.longitude,
              }}
            />

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
    </>
  ) : (
    <>Loading...</>
  );
}

export default memo(MyComponent);
