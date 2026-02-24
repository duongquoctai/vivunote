"use client";
import { Location } from "@/app/types/map";
import dynamic from "next/dynamic";
import { useState } from "react";
import SearchPanel from "./SearchPanel";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p className="text-center p-10">Đang tải bản đồ...</p>,
});

const DEFAULT_CENTER: [number, number] = [10.762622, 106.660172]; // Tọa độ TP.HCM

const MapLoader = () => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "initial",
      lat: DEFAULT_CENTER[0],
      lon: DEFAULT_CENTER[1],
      name: "Thành phố Hồ Chí Minh",
    },
  ]);

  const handleUpdateLocations = (newLocations: Location[]) => {
    setLocations(newLocations);
    if (newLocations.length > 0) {
      const lastLocation = newLocations[newLocations.length - 1];
      if (lastLocation.lat !== 0 && lastLocation.lon !== 0) {
        setCenter([lastLocation.lat, lastLocation.lon]);
      }
    }
  };

  const markers = locations
    .filter((loc) => loc.lat !== 0 && loc.lon !== 0)
    .map((loc) => ({
      position: [loc.lat, loc.lon] as [number, number],
      label: loc.name,
    }));

  return (
    <div className="relative w-full h-full">
      <SearchPanel
        locations={locations}
        onUpdateLocations={handleUpdateLocations}
      />
      <div className="w-full h-full">
        <MapComponent center={center} markers={markers} />
      </div>
    </div>
  );
};

export default MapLoader;
