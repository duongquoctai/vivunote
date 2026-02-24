export interface SearchResult {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
}

export interface Location {
  id: string;
  lat: number;
  lon: number;
  name: string;
}

export interface MapTilerFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  text_vi?: string;
  place_name_vi?: string;
}

export interface MapTilerResponse {
  type: string;
  features: MapTilerFeature[];
}
