// app/api/weather/route.js

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const location = searchParams.get("location");
  const language = searchParams.get("language") || "en";
  const kind = searchParams.get("kind") || "default";

  if (!location) {
    return NextResponse.json(
      { error: "Please provide a location" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server error: API key not configured" },
      { status: 500 }
    );
  }

  const encodedLocation = encodeURIComponent(location);
  const url =
    kind === "forecast"
      ? `https://api.openweathermap.org/data/2.5/forecast?q=${encodedLocation}&appid=${apiKey}&units=metric&lang=${language}`
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&appid=${apiKey}&units=metric&lang=${language}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Server error: unable to fetch weather data" },
      { status: 500 }
    );
  }
}
