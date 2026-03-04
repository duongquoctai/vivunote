"use client";

import { Location, LocationProperties } from "@/app/types/map";
import React, { createContext, useCallback, useContext, useState } from "react";

const DEFAULT_CENTER: [number, number] = [10.762622, 106.660172];

export interface ClickedPlace {
  name: string;
  address?: string;
  lat: number;
  lon: number;
  type?: string;
}

interface MapContextType {
  locations: Location[];
  center: [number, number];
  journeyName: string;
  clickedPlace: ClickedPlace | null;
  selectedLocationId: string | null;
  setLocations: (locs: Location[]) => void;
  setCenter: (center: [number, number]) => void;
  setJourneyName: (name: string) => void;
  setClickedPlace: (place: ClickedPlace | null) => void;
  setSelectedLocationId: (id: string | null) => void;
  updateLocationProperties: (
    id: string,
    properties: LocationProperties,
  ) => void;
  resetMap: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [journeyName, setJourneyName] = useState<string>("");
  const [clickedPlace, setClickedPlace] = useState<ClickedPlace | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "initial",
      lat: DEFAULT_CENTER[0],
      lon: DEFAULT_CENTER[1],
      name: "Thành phố Hồ chí Minh",
    },
  ]);

  const updateLocationProperties = useCallback(
    (id: string, properties: LocationProperties) => {
      setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? { ...loc, properties } : loc)),
      );
    },
    [],
  );

  const resetMap = useCallback(() => {
    setLocations([
      {
        id: "initial",
        lat: DEFAULT_CENTER[0],
        lon: DEFAULT_CENTER[1],
        name: "Thành phố Hồ chí Minh",
      },
    ]);
    setCenter(DEFAULT_CENTER);
    setJourneyName("");
    setClickedPlace(null);
    setSelectedLocationId(null);
  }, []);

  return (
    <MapContext.Provider
      value={{
        locations,
        center,
        journeyName,
        clickedPlace,
        setLocations,
        setCenter,
        setJourneyName,
        setClickedPlace,
        selectedLocationId,
        setSelectedLocationId,
        updateLocationProperties,
        resetMap,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context)
    throw new Error("useMapContext must be used within MapProvider");
  return context;
};
