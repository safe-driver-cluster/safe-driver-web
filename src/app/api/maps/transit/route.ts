
import { type NextRequest, NextResponse } from "next/server";
import { mapsService } from "@/lib/maps-service";

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json();

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    const result = await mapsService.getBusTransitDirections(origin, destination);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Error in /api/maps/transit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transit directions" },
      { status: 500 }
    );
  }
}
