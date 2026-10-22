import { container } from "@/infrastructure/container";
import { NextResponse } from "next/server";

// Dipakai saat cookie masih valid tetapi user sudah tidak ada / dinonaktifkan di database.
export async function GET(request: Request) {
  await container.signOut.execute();
  return NextResponse.redirect(new URL("/login", request.url));
}
