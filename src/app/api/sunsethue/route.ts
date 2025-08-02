import { NextRequest, NextResponse } from "next/server";

// Docs: https://sunsethue.com/api
// Example: https://sunsethue.com/api/v1/prediction?lat=52.52&lng=13.405&tz=Europe/Berlin

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lng");
  const date = searchParams.get("date");
  // Parse timezone as a float (nfloat), default to Berlin (UTC+2 in summer, UTC+1 in winter)
  const timezoneParam = searchParams.get("tz");
  // Europe/Berlin is UTC+1 (winter) or UTC+2 (summer). We'll use 2 as default for summer.
  const timezone = timezoneParam !== null ? parseFloat(timezoneParam) : 2;
  // During development, allow using a local example API key to avoid wasting real API credits
  const isDevelopment = process.env.NODE_ENV === "development";
  const exampleData = {
    time: "2025-07-09T13:29:35.999Z",
    location: {
      latitude: 52.52,
      longitude: 13.405,
    },
    grid_location: {
      latitude: 53,
      longitude: 13,
    },
    data: [
      {
        type: "sunrise",
        model_data: true,
        quality: 0,
        cloud_cover: 1,
        quality_text: "Poor",
        time: "2025-07-09T02:53:00.000Z",
        direction: 49.7,
        magics: {
          blue_hour: ["2025-07-09T01:50:00.000Z", "2025-07-09T02:14:00.000Z"],
          golden_hour: ["2025-07-09T02:25:00.000Z", "2025-07-09T03:15:00.000Z"],
        },
      },
      {
        type: "sunset",
        model_data: true,
        quality: 0.02,
        cloud_cover: 0.84,
        quality_text: "Poor",
        time: "2025-07-09T19:28:00.000Z",
        direction: 310.3,
        magics: {
          blue_hour: ["2025-07-09T20:08:00.000Z", "2025-07-09T20:32:00.000Z"],
          golden_hour: ["2025-07-09T19:07:00.000Z", "2025-07-09T19:57:00.000Z"],
        },
      },
      {
        type: "sunrise",
        model_data: true,
        quality: 0.28,
        cloud_cover: 0.72,
        quality_text: "Fair",
        time: "2025-07-10T02:54:00.000Z",
        direction: 49.9,
        magics: {
          blue_hour: ["2025-07-10T01:51:00.000Z", "2025-07-10T02:15:00.000Z"],
          golden_hour: ["2025-07-10T02:26:00.000Z", "2025-07-10T03:16:00.000Z"],
        },
      },
      {
        type: "sunset",
        model_data: true,
        quality: 0.2,
        cloud_cover: 0.3,
        quality_text: "Poor",
        time: "2025-07-10T19:28:00.000Z",
        direction: 310.1,
        magics: {
          blue_hour: ["2025-07-10T20:07:00.000Z", "2025-07-10T20:31:00.000Z"],
          golden_hour: ["2025-07-10T19:06:00.000Z", "2025-07-10T19:56:00.000Z"],
        },
      },
      {
        type: "sunrise",
        model_data: true,
        quality: 0.08,
        cloud_cover: 0.49,
        quality_text: "Poor",
        time: "2025-07-11T02:55:00.000Z",
        direction: 50.2,
        magics: {
          blue_hour: ["2025-07-11T01:53:00.000Z", "2025-07-11T02:16:00.000Z"],
          golden_hour: ["2025-07-11T02:27:00.000Z", "2025-07-11T03:17:00.000Z"],
        },
      },
      {
        type: "sunset",
        model_data: true,
        quality: 0.54,
        cloud_cover: 0.85,
        quality_text: "Good",
        time: "2025-07-11T19:27:00.000Z",
        direction: 309.8,
        magics: {
          blue_hour: ["2025-07-11T20:06:00.000Z", "2025-07-11T20:30:00.000Z"],
          golden_hour: ["2025-07-11T19:05:00.000Z", "2025-07-11T19:55:00.000Z"],
        },
      },
    ],
  };
  const apiKey = isDevelopment ? "Example" : process.env.SUNSET_HUE_API_KEY;

  if (!latitude || !longitude || !date) {
    return NextResponse.json(
      { error: "Please provide latitude, longitude, and date parameters" },
      { status: 400 }
    );
  }
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing SUNSET_HUE_API_KEY in environment" },
      { status: 500 }
    );
  }

  // If in development and using the example key, return the example data
  if (isDevelopment && apiKey === "Example") {
    return NextResponse.json(exampleData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }

  const url = `https://api.sunsethue.com/forecast?latitude=${encodeURIComponent(
    latitude
  )}&longitude=${encodeURIComponent(longitude)}&date=${encodeURIComponent(
    date
  )}&timezone=${encodeURIComponent(timezone)}`;

  console.info("Fetching Sunsethue event from:", url);

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch from Sunsethue API" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching Sunsethue data:", error);
    return NextResponse.json(
      { error: "Server error: unable to fetch Sunsethue data" },
      { status: 500 }
    );
  }
}
