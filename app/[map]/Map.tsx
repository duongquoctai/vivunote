"use client";

import { LocationProperties } from "@/app/types/map";
import { Icon } from "@iconify/react";
import type { Map as MapLibreInstance } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import MapLibre, {
  MapLayerMouseEvent,
  MapRef,
  Marker,
  MarkerEvent,
} from "react-map-gl/maplibre";
import MapRoutes from "./MapRoutes";

interface MarkerData {
  id: string;
  position: [number, number];
  label?: string;
  properties?: LocationProperties;
}

interface MapProps {
  center: [number, number];
  markers: MarkerData[];
  onUpdateProperties: (id: string, properties: LocationProperties) => void;
}

import { useMapContext } from "../context/MapContext";

const MAPTILER_KEY = "320DtUhEatYrm1cai9PT";
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

function Map({ center, markers }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const {
    clickedPlace,
    setClickedPlace,
    selectedLocationId,
    setSelectedLocationId,
  } = useMapContext();

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [center[1], center[0]],
        zoom: 15,
        duration: 1500,
      });
    }
  }, [center]);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const map = e.target as MapLibreInstance;
    const targetLayerPrefixes = [
      "poi",
      "place",
      "transit",
      "station",
      "airport",
    ];

    const style = map.getStyle();
    if (!style?.layers) return;

    const availableLayers = style.layers
      .filter((layer: { id: string }) =>
        targetLayerPrefixes.some((prefix) => layer.id.includes(prefix)),
      )
      .map((layer: { id: string }) => layer.id);

    const features =
      availableLayers.length > 0
        ? map.queryRenderedFeatures(e.point, { layers: availableLayers })
        : map.queryRenderedFeatures(e.point);

    const validFeature = features.find(
      (f) => f.properties && (f.properties.name || f.properties.name_vi),
    );

    if (!validFeature) {
      setClickedPlace(null);
      setSelectedLocationId(null);
      return;
    }

    const { lat, lng } = e.lngLat;
    const name =
      validFeature.properties.name_vi ||
      validFeature.properties.name ||
      "Vị trí đã chọn";

    if (clickedPlace && clickedPlace.name === name) {
      setClickedPlace(null);
    } else {
      setClickedPlace({
        name,
        address:
          validFeature.properties.address ||
          validFeature.properties.place_name ||
          validFeature.properties.city ||
          "",
        lat,
        lon: lng,
        type:
          validFeature.properties.class ||
          validFeature.properties.type ||
          validFeature.layer.id,
      });
      setSelectedLocationId(null);
    }
  };

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    const map = e.target as MapLibreInstance;
    const style = map.getStyle();
    if (!style?.layers) return;

    const targetLayerPrefixes = [
        "poi",
        "place",
        "transit",
        "station",
        "airport",
      ],
      availableLayers = style.layers
        .filter((layer: { id: string }) =>
          targetLayerPrefixes.some((prefix) => layer.id.includes(prefix)),
        )
        .map((layer: { id: string }) => layer.id);

    const features =
      availableLayers.length > 0
        ? map.queryRenderedFeatures(e.point, { layers: availableLayers })
        : map.queryRenderedFeatures(e.point);

    const hasPoi = features.some(
      (f) => f.properties && (f.properties.name || f.properties.name_vi),
    );
    map.getCanvas().style.cursor = hasPoi ? "pointer" : "";
  };

  const routeLocations = useMemo(
    () =>
      markers.map((m) => ({
        lat: m.position[0],
        lon: m.position[1],
      })),
    [markers],
  );

  const handleMarkerClick = (e: MarkerEvent<MouseEvent>, id: string) => {
    e.originalEvent.stopPropagation();
    if (selectedLocationId === id) {
      setSelectedLocationId(null);
    } else {
      setSelectedLocationId(id);
      setClickedPlace(null);
    }
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapLibre
        ref={mapRef}
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: 13,
        }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
      >
        <MapRoutes locations={routeLocations} />

        {clickedPlace && (
          <Marker
            longitude={clickedPlace.lon}
            latitude={clickedPlace.lat}
            anchor="bottom"
          >
            <Icon
              icon="openmoji:joystick"
              className="w-12 h-12 drop-shadow-lg"
            />
          </Marker>
        )}

        {markers.map((marker) => (
          <div key={marker.id}>
            <Marker
              longitude={marker.position[1]}
              latitude={marker.position[0]}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(e, marker.id)}
            >
              <div className="text-red-500 cursor-pointer hover:scale-110 transition-transform drop-shadow-lg">
                <Icon icon="mdi:map-marker" className="w-10 h-10" />
              </div>
            </Marker>
          </div>
        ))}
      </MapLibre>
    </div>
  );
}

export default Map;
