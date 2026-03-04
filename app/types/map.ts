export interface SearchResult {
  name: string;
  display_name: string;
  lat?: string;
  lon?: string;
  place_id?: string;
}

export interface LocationProperties {
  links?: string[];
  notes?: string;
}

export interface Location {
  id: string;
  lat: number;
  lon: number;
  name: string;
  properties?: LocationProperties;
}

export interface GoongResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
}

export interface GoongResponse {
  results: GoongResult[];
  status: string;
}

export interface GoongAutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GoongAutocompleteResponse {
  predictions: GoongAutocompletePrediction[];
  status: string;
}

export interface GoongPlaceDetailResponse {
  result: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    name: string;
    formatted_address: string;
  };
  status: string;
}
