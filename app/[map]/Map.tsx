"use client";

import { LocationProperties } from "@/app/types/map";
import { Icon } from "@iconify/react";
import type { Map as MapLibreInstance } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import MapLibre, {
  MapLayerMouseEvent,
  MapRef,
  Marker,
  MarkerEvent,
  Popup,
} from "react-map-gl/maplibre";
import LocationPopup from "./LocationPopup";
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

function Map({ center, markers, onUpdateProperties }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [activePopupIds, setActivePopupIds] = useState<Set<string>>(new Set());
  const { clickedPlace, setClickedPlace } = useMapContext();

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
    // Common MapTiler layer prefixes for POIs and labels
    const targetLayerPrefixes = [
      "poi",
      "place",
      "transit",
      "station",
      "airport",
    ];

    // Safely find layers that exist in the current style and match our targets
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
        : map.queryRenderedFeatures(e.point); // Fallback to all features if discovery fails

    // Filter for features that actually describe a specific place (have names)
    const validFeature = features.find(
      (f) => f.properties && (f.properties.name || f.properties.name_vi),
    );

    const { lat, lng } = e.lngLat;

    if (validFeature) {
      const name =
        validFeature.properties.name_vi ||
        validFeature.properties.name ||
        "Vị trí đã chọn";

      // Toggle behavior: if clicking the same POI, deselect it
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
      }
    } else {
      // If clicking empty space and something is selected, deselect it (toggle behavior)
      if (clickedPlace) {
        setClickedPlace(null);
      } else {
        // If nothing was selected, perform a regular generic selection
        setClickedPlace({
          name: "Vị trí đã chọn",
          lat,
          lon: lng,
        });
      }
    }
    setActivePopupIds(new Set());
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
    ];
    const availableLayers = style.layers
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

    const marker = markers.find((m) => m.id === id);
    if (marker && mapRef.current) {
      mapRef.current.flyTo({
        center: [marker.position[1], marker.position[0]],
        zoom: 15,
        duration: 1000,
      });
    }

    setActivePopupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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

        {/* Clicked Place Marker (Joystick) */}
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
            {activePopupIds.has(marker.id) && (
              <Popup
                longitude={marker.position[1]}
                latitude={marker.position[0]}
                anchor="top"
                closeButton={false}
                closeOnClick={false}
                offset={10}
                maxWidth="300px"
                onClose={() => {
                  setActivePopupIds((prev) => {
                    const next = new Set(prev);
                    next.delete(marker.id);
                    return next;
                  });
                }}
              >
                <LocationPopup
                  id={marker.id}
                  name={marker.label || "Vị trí"}
                  properties={marker.properties}
                  onUpdate={onUpdateProperties}
                />
              </Popup>
            )}
          </div>
        ))}
      </MapLibre>
    </div>
  );
}

export default Map;
