import { NextResponse } from 'next/server'

let totalVisits = 0

export async function GET() {
  return NextResponse.json({ totalVisits })
}

export async function POST() {
  totalVisits += 1
  return NextResponse.json({ totalVisits })
}