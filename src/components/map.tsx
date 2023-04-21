import { useState, useEffect, memo, useCallback } from "react";
import {
  GoogleMap,
  LoadScriptNext,
  CircleF,
  StandaloneSearchBox,
  MarkerF,
  DistanceMatrixService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { env } from "~/env.mjs";
import useGeoLocation from "~/hooks/useGeoLocation";
import { useAtomValue } from "jotai";
import { distanceAtom } from "~/pages";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { formatDuration } from "date-fns";
import { LinkIcon } from "@heroicons/react/24/outline";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

const LIBRARIES: (
  | "drawing"
  | "geometry"
  | "localContext"
  | "places"
  | "visualization"
)[] = ["places"];

function MyComponent() {
  const { geoPosition } = useGeoLocation();
  const distance = useAtomValue(distanceAtom);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const [markerClusterer, setMarkerClusterer] =
    useState<MarkerClusterer | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<
    google.maps.places.PlaceResult[]
  >([]);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  const [directions, setDirections] = useState<google.maps.DirectionsResult>();

  const fetchDirections = useCallback(
    (place?: google.maps.places.PlaceResult) => {
      if (!place) return;

      const service = new google.maps.DirectionsService();

      void service.route(
        {
          origin: {
            lat: geoPosition?.coords.latitude ?? 0,
            lng: geoPosition?.coords.longitude ?? 0,
          },
          destination: {
            lat: place.geometry?.location?.lat() ?? 0,
            lng: place.geometry?.location?.lng() ?? 0,
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirections(result);
          }
        }
      );
    },
    [geoPosition, setDirections]
  );

  useEffect(() => {
    fetchDirections(selectedPlace ?? undefined);
  }, [selectedPlace, fetchDirections]);

  return geoPosition ? (
    <div className="mx-auto flex h-full w-full justify-center  px-4">
      <div className="h-full w-full md:h-[700px] md:w-[1000px]">
        <LoadScriptNext
          googleMapsApiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={LIBRARIES}
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
            zoom={8}
            onLoad={(map) => {
              setMap(map);
              const markerClusterer = new MarkerClusterer({
                map,
              });
              setMarkerClusterer(markerClusterer);
              setInfoWindow(
                new google.maps.InfoWindow({
                  content: "",
                  disableAutoPan: true,
                })
              );
            }}
            onUnmount={() => setMap(null)}
          >
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: "orange",
                    zIndex: 999,
                  },
                }}
              />
            )}

            <StandaloneSearchBox
              onLoad={(standalone) => {
                setSearchBox(standalone);
              }}
              onPlacesChanged={() => {
                setSearchResults(searchBox?.getPlaces() ?? []);
                const markers = searchBox?.getPlaces()?.map((place) => {
                  const { geometry, name } = place;
                  const marker = new google.maps.Marker({
                    position: {
                      lat: geometry?.location?.lat() ?? 0,
                      lng: geometry?.location?.lng() ?? 0,
                    },
                  });

                  marker.addListener("click", () => {
                    infoWindow?.setContent(name);
                    infoWindow?.open(map, marker);
                  });

                  return marker;
                });

                // Clears markers and new ones
                markerClusterer?.clearMarkers();
                markerClusterer?.addMarkers(markers ?? []);
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
              onLoad={(e) => {
                const bounds = e.getBounds();
                if (bounds !== null) {
                  map?.fitBounds(bounds);
                }
              }}
              options={{
                radius: distance * 1609,
                strokeColor: "blue",
                fillColor: "blue",
                zIndex: 500,
              }}
            />
          </GoogleMap>
        </LoadScriptNext>
      </div>
      <div className="relative h-full max-h-[700px] w-96 flex-col overflow-auto border bg-neutral-200">
        <h2 className="sticky top-0 z-50 w-full border-b-2 border-blue-500 bg-inherit p-2 px-8 text-xl font-semibold">
          Search Results
        </h2>
        <ul className="w-full space-y-2 divide-y-2">
          {searchResults.map((place, i) => (
            <PlaceCard
              key={i}
              place={place}
              index={i}
              map={map}
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              geoPosition={geoPosition.coords}
            />
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <></>
  );
}

const metersToMiles = (meters: number) => {
  return meters * 0.000621371;
};

const secondsToDuration = (time: number): Duration => {
  const days = Math.floor(time / 86400);
  const hours = Math.floor((time % 86400) / 3600);
  const minutes = Math.floor(((time % 86400) % 3600) / 60);
  const seconds = Math.floor(((time % 86400) % 3600) % 60);
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

const PlaceCard = ({
  place,
  index: i,
  map,
  geoPosition,
  setSelectedPlace,
  selectedPlace,
}: {
  place: google.maps.places.PlaceResult;
  index: number;
  map: google.maps.Map | null;
  geoPosition: {
    latitude: number;
    longitude: number;
  };
  setSelectedPlace: React.Dispatch<
    React.SetStateAction<google.maps.places.PlaceResult | null>
  >;
  selectedPlace: google.maps.places.PlaceResult | null;
}) => {
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<
    google.maps.Duration | undefined | null
  >(null);

  return (
    <li
      key={`${i}${place.name ?? ""}`}
      className={`relative p-2 px-8 hover:bg-gray-300 ${
        selectedPlace?.place_id === place.place_id ? "bg-blue-300" : ""
      }`}
      onClick={() => {
        if (map && place.geometry?.location) {
          map.setCenter(place.geometry.location);
        }
        setSelectedPlace(place);
      }}
    >
      {selectedPlace?.place_id === place.place_id && (
        <div className="absolute top-0 -left-3.5">
          <CheckIcon className="h-5 w-5 text-red-500" />
        </div>
      )}
      <div className="flex items-center">
        <span>{i + 1}</span> -{" "}
        <span className="text-lg font-semibold">{place.name}</span>
      </div>
      <div>{place.formatted_address}</div>
      <div>Distance: {distance?.slice(0, 4)} Miles</div>
      {duration && (
        <div>Duration: {formatDuration(secondsToDuration(duration.value))}</div>
      )}
      <Sheet>
        <SheetTrigger className="ml-auto mt-2 flex items-center justify-center rounded bg-blue-500 px-4 py-2 hover:bg-blue-700 hover:text-white">
          More Info
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">
              {place.name}
            </SheetTitle>
            <SheetDescription>
              <div>Address: {place.formatted_address}</div>
              <div>
                Phone:{" "}
                {place.formatted_phone_number ??
                  "Whoops! Looks like this place doesn't have a number!"}
              </div>
              {place.url && (
                <Link href={place.url} className="hover:underline">
                  <LinkIcon className="h-5 w-5" /> {place.url}
                </Link>
              )}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <DistanceMatrixService
        callback={(res) => {
          setDistance(
            String(
              metersToMiles(res?.rows[0]?.elements[0]?.distance.value ?? 0) ??
                ""
            )
          );
          setDuration(res?.rows[0]?.elements[0]?.duration);
        }}
        options={{
          origins: [
            new google.maps.LatLng({
              lat: geoPosition.latitude,
              lng: geoPosition.longitude,
            }),
          ],
          destinations: [
            {
              placeId: place.place_id,
            },
          ],
          travelMode: google.maps.TravelMode.DRIVING,
        }}
      />
    </li>
  );
};

export default memo(MyComponent);
