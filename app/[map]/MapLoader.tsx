"use client";
import { Location, LocationProperties } from "@/app/types/map";
import dynamic from "next/dynamic";
import { useState } from "react";
import SearchPanel from "./SearchPanel";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p className="text-center p-10">Đang tải bản đồ...</p>,
});

const DEFAULT_CENTER: [number, number] = [10.762622, 106.660172]; // Tọa độ TP.HCM

import { useSession } from "next-auth/react";
import AuthModal from "../components/auth/AuthModal";

const MapLoader = () => {
  const { status } = useSession();
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "initial",
      lat: DEFAULT_CENTER[0],
      lon: DEFAULT_CENTER[1],
      name: "Thành phố Hồ chí Minh",
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

  const handleUpdateProperties = (
    id: string,
    properties: LocationProperties,
  ) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, properties } : loc)),
    );
  };

  const markers = locations
    .filter((loc) => loc.lat !== 0 && loc.lon !== 0)
    .map((loc) => ({
      id: loc.id,
      position: [loc.lat, loc.lon] as [number, number],
      label: loc.name,
      properties: loc.properties,
    }));

  const isUnauthenticated = status === "unauthenticated";

  return (
    <div className="relative w-full h-full">
      {isUnauthenticated && <AuthModal />}

      <div
        className={`w-full h-full transition-all duration-500 ${isUnauthenticated ? "pointer-events-none select-none blur-[2px] opacity-50" : ""}`}
      >
        <SearchPanel
          locations={locations}
          onUpdateLocations={handleUpdateLocations}
        />
        <div className="w-full h-full">
          <MapComponent
            center={center}
            markers={markers}
            onUpdateProperties={handleUpdateProperties}
          />
        </div>
      </div>
    </div>
  );
};

export default MapLoader;
