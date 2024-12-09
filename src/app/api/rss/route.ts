// app/api/weather/route.js

import { NextRequest, NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get("feed");

  if (!feedUrl) {
    return NextResponse.json(
      { error: "Please provide a location" },
      { status: 400 }
    );
  }

  // const encodedLocation = encodeURIComponent(feedUrl);
  const url = feedUrl;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message },
        { status: response.status }
      );
    }

    const xmlData = await response.text();

    console.log("xmlData", xmlData);

    // Parse the XML data into JSON
    const jsonData = await parseStringPromise(xmlData);

    return NextResponse.json(jsonData, { status: 200 });
  } catch (error) {
    console.error("Error fetching rss data:", error);
    return NextResponse.json(
      { error: "Server error: unable to fetch rss data" },
      { status: 500 }
    );
  }
}
