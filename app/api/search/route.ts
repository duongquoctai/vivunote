import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 },
    );
  }

  // Use the key specified by the user, falling back to a more standard name if needed
  const apiKey =
    process.env.YOUR_MAPTILER_API_KEY_HERE || process.env.MAPTILER_API_KEY;

  if (!apiKey) {
    console.error("MapTiler API key not set in environment variables");
    return NextResponse.json(
      { error: "Search service is not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${query}.json?language=vi&proximity=ip&fuzzyMatch=true&limit=5&key=${apiKey}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MapTiler Geocoding API error:", errorText);
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
      { error: "Failed to fetch data from search API" },
      { status: 500 },
    );
  }
}
