import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const placeId = searchParams.get("place_id");

  if (!query && !placeId) {
    return NextResponse.json(
      { error: "Query parameter 'q' or 'place_id' is required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOONG_API_KEY;

  if (!apiKey) {
    console.error("GOONG_API_KEY not set in environment variables");
    return NextResponse.json(
      { error: "Search service (Goong) is not configured" },
      { status: 500 },
    );
  }

  try {
    let url = "";
    if (placeId) {
      url = `https://rsapi.goong.io/v2/place/detail?place_id=${placeId}&api_key=${apiKey}`;
    } else {
      url = `https://rsapi.goong.io/v2/place/autocomplete?input=${encodeURIComponent(query!)}&limit=10&api_key=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Goong API error:", errorText);
      return NextResponse.json(
        { error: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Goong API" },
      { status: 500 },
    );
  }
}
