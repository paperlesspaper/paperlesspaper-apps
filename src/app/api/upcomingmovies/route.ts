// app/api/weather/route.js

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");

  /*if (!feedUrl) {
    return NextResponse.json(
      { error: "Please provide a location" },
      { status: 400 }
    );
  } */

  const API_KEY = process.env.TMDB_API_KEY;
  const BASE_URL = "http://api.themoviedb.org/3/movie/upcoming";

  // const encodedLocation = encodeURIComponent(feedUrl);
  const url = `${BASE_URL}?api_key=${API_KEY}&language=${language || "en-US"}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message },
        { status: response.status }
      );
    }

    const jsonData = await response.json();

    return NextResponse.json(jsonData, { status: 200 });
  } catch (error) {
    console.error("Error fetching rss data:", error);
    return NextResponse.json(
      { error: "Server error: unable to fetch rss data" },
      { status: 500 }
    );
  }
}
