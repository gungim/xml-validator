import { NextResponse } from "next/server";

const DATA_TYPES = ["string", "number", "boolean", "object", "array"];

export async function GET() {
  return NextResponse.json(DATA_TYPES);
}
