import { clearSessionCookie } from "@/lib/session";
import { NextResponse } from "next/server";

// Dipakai saat cookie masih valid tetapi user sudah tidak ada / dinonaktifkan di database.
export async function GET(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
