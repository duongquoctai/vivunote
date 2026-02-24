"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";

interface MapRoutesProps {
  locations: Array<{ lat: number; lon: number }>;
}

const MapRoutes = ({ locations }: MapRoutesProps) => {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const { current: map } = useMap();
  const prevLocationsRef = useRef<string>("");

  useEffect(() => {
    const validLocations = locations.filter(
      (loc) => loc.lat !== 0 && loc.lon !== 0,
    );
    const locationsKey = JSON.stringify(validLocations);

    if (locationsKey === prevLocationsRef.current) return;
    prevLocationsRef.current = locationsKey;

    if (validLocations.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoutePoints((prev) => (prev.length > 0 ? [] : prev));
      return;
    }

    const fetchRoute = async () => {
      try {
        const coordinates = validLocations
          .map((loc) => `${loc.lon},${loc.lat}`)
          .join(";");

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
        );

        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes[0]) {
          const points = data.routes[0].geometry.coordinates; // [lon, lat]
          setRoutePoints(points);

          if (points.length > 0 && map) {
            const bounds = points.reduce(
              (acc: maplibregl.LngLatBounds, coord: [number, number]) => {
                return acc.extend(coord);
              },
              new maplibregl.LngLatBounds(points[0], points[0]),
            );

            map.fitBounds(bounds, { padding: 50, animate: true });
          }
        }
      } catch (error) {
        console.error("Routing error:", error);
      }
    };

    fetchRoute();
  }, [locations, map]);

  if (routePoints.length === 0) return null;

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: routePoints,
        },
      },
    ],
  };

  return (
    <Source type="geojson" data={geojson}>
      <Layer
        id="route"
        type="line"
        layout={{
          "line-join": "round",
          "line-cap": "round",
        }}
        paint={{
          "line-color": "#3b82f6",
          "line-width": 5,
          "line-opacity": 1,
          "line-dasharray": [2, 2],
        }}
      />
    </Source>
  );
};

export default MapRoutes;
