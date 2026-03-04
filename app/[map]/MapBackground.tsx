"use client";

import dynamic from "next/dynamic";
import POIDrawer from "../components/map/POIDrawer";
import SavedLocationDrawer from "../components/map/SavedLocationDrawer";
import { useMapContext } from "../context/MapContext";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-400">
      Đang tải...
    </div>
  ),
});

const MapBackground = () => {
  const { locations, center, updateLocationProperties } = useMapContext();

  const markers = locations
    .filter((loc) => loc.lat !== 0 && loc.lon !== 0)
    .map((loc) => ({
      id: loc.id,
      position: [loc.lat, loc.lon] as [number, number],
      label: loc.name,
      properties: loc.properties,
    }));

  return (
    <>
      <div className="fixed inset-0 w-full h-full z-0">
        <MapComponent
          center={center}
          markers={markers}
          onUpdateProperties={updateLocationProperties}
        />
      </div>
      <POIDrawer />
      <SavedLocationDrawer />
    </>
  );
};

export default MapBackground;
