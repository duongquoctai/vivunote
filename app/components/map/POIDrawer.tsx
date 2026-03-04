"use client";

import { useMapContext } from "@/app/context/MapContext";
import { Icon } from "@iconify/react";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";

const POIDrawer = () => {
  const {
    locations,
    setLocations,
    clickedPlace,
    setClickedPlace,
    setSelectedLocationId,
  } = useMapContext();

  const isOpen = clickedPlace !== null;

  const handleClose = () => {
    setClickedPlace(null);
  };

  const handleAddPOI = () => {
    if (clickedPlace) {
      const newLocation = {
        id: Math.random().toString(36).substr(2, 9),
        lat: clickedPlace.lat,
        lon: clickedPlace.lon,
        name: clickedPlace.name,
      };
      setLocations([...locations, newLocation]);
      setClickedPlace(null);
      setSelectedLocationId(newLocation.id);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={clickedPlace?.name || "Chi tiết vị trí"}
      description={clickedPlace?.address}
      icon="openmoji:joystick"
    >
      <div className="space-y-6">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
            Thông tin địa điểm
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Icon icon="mdi:map-marker-outline" className="w-4 h-4" />
              <span>
                {clickedPlace?.lat.toFixed(6)}, {clickedPlace?.lon.toFixed(6)}
              </span>
            </div>
            {clickedPlace?.type && (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Icon icon="mdi:tag-outline" className="w-4 h-4" />
                <span className="capitalize">
                  {clickedPlace.type.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full py-4 text-sm font-bold shadow-lg shadow-blue-500/20"
            icon="mdi:plus"
            onClick={handleAddPOI}
          >
            Thêm vào hành trình
          </Button>
          <Button
            variant="outline"
            className="w-full py-4 text-sm font-bold"
            icon="mdi:google-maps"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${clickedPlace?.lat},${clickedPlace?.lon}`,
                "_blank",
              )
            }
          >
            Xem trên Google Maps
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default POIDrawer;
