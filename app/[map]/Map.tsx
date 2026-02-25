"use client";

import { LocationProperties } from "@/app/types/map";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import MapLibre, {
  MapRef,
  Marker,
  MarkerEvent,
  Popup,
  StyleSpecification,
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

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

function Map({ center, markers, onUpdateProperties }: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [activePopupIds, setActivePopupIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [center[1], center[0]],
        zoom: 15,
        duration: 1500,
      });
    }
  }, [center]);

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
        onClick={() => setActivePopupIds(new Set())}
      >
        <MapRoutes locations={routeLocations} />

        {markers.map((marker) => (
          <div key={marker.id}>
            <Marker
              longitude={marker.position[1]}
              latitude={marker.position[0]}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(e, marker.id)}
            >
              <div className="text-red-500 cursor-pointer hover:scale-110 transition-transform drop-shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    fillRule="evenodd"
                    d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 3.58-3.14c.06-.059.118-.12.175-.181l.057-.06a11.376 11.376 0 0 0 2.508-4.661c.421-1.385.498-2.603.226-3.705-.272-1.102-.91-2.112-1.84-3.042C15.698 5.642 14.16 4.62 12 4.62c-2.16 0-3.698 1.022-4.962 2.285-.93.93-1.568 1.94-1.84 3.042-.272 1.102-.195 2.32.226 3.705a11.376 11.376 0 0 0 2.508 4.661c.057.06.115.122.175.181a16.975 16.975 0 0 0 3.58 3.14Z"
                    clipRule="evenodd"
                  />
                  <path d="M12 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                </svg>
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
