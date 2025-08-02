import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("q");
  if (!input) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }
  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Missing Google API key" },
      { status: 500 }
    );
  }

  // 1. Autocomplete
  const autoRes = await fetch(
    `${AUTOCOMPLETE_URL}?input=${encodeURIComponent(
      input
    )}&types=(cities)&key=${GOOGLE_API_KEY}`
  );
  const autoData = await autoRes.json();
  if (!autoData.predictions || autoData.predictions.length === 0) {
    return NextResponse.json({ error: "No results found" }, { status: 404 });
  }

  // 2. Get details for the first prediction
  const placeId = autoData.predictions[0].place_id;
  const detailsRes = await fetch(
    `${DETAILS_URL}?place_id=${placeId}&fields=geometry,name,formatted_address&key=${GOOGLE_API_KEY}`
  );
  const detailsData = await detailsRes.json();
  const loc = detailsData.result?.geometry?.location;

  type Prediction = { description: string; place_id: string };
  return NextResponse.json({
    predictions: (autoData.predictions as Prediction[]).map((p) => ({
      description: p.description,
      place_id: p.place_id,
    })),
    location: loc ? { lat: loc.lat, lng: loc.lng } : null,
    name: detailsData.result?.name,
    address: detailsData.result?.formatted_address,
  });
}
