/**
 * GET  /api/admin/org          — list all teams with subteams
 * POST /api/admin/org/team     — create team
 * POST /api/admin/org/subteam  — create subteam
 * Note: roles endpoint dihapus — admin dideteksi via group_name='Administrator' atau is_admin flag
 */

import { getAllTeams, createTeam, createSubTeam } from "@/lib/controllers/org.controller";
import { apiGuard } from "@/lib/security/rbac";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await apiGuard("manage:org");
  if (guard instanceof Response) return guard;

  const data = await getAllTeams();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const guard = await apiGuard("manage:org");
  if (guard instanceof Response) return guard;

  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === "create_team") {
      const team = await createTeam(data.team_name, data.team_type ?? "programmer");
      return NextResponse.json({ success: true, team });
    }

    if (action === "create_subteam") {
      const subTeam = await createSubTeam(data.sub_team_name, data.team_id);
      return NextResponse.json({ success: true, subTeam });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
