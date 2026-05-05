/**
 * GET /api/reporting?type=monthly&year=2026&month=5
 * POST /api/reporting  { type, params }
 * Modular reporting endpoint.
 */

import { generateReport, getAvailableReportTypes } from "@/lib/reporting/report.engine";
import { apiGuard } from "@/lib/security/rbac";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await apiGuard("view:reporting");
  if (guard instanceof Response) return guard;

  // List available report types
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json({ types: getAvailableReportTypes() });
  }

  try {
    const params: any = {};
    searchParams.forEach((v: string, k: string) => { if (k !== "type") params[k] = v; });

    // Coerce numeric params
    if (params.year)    params.year    = parseInt(params.year);
    if (params.month)   params.month   = parseInt(params.month);
    if (params.groupId) params.groupId = parseInt(params.groupId);

    const result = await generateReport(type, params);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await apiGuard("view:reporting");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();
    const { type, ...params } = body;
    if (!type) return NextResponse.json({ error: "type wajib diisi" }, { status: 400 });

    const result = await generateReport(type, params);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
