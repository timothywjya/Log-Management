"use server";

import { container } from "@/infrastructure/container";
import { redirect } from "next/navigation";

export async function authenticate(formData: FormData) {
  const result = await container.authenticateUser.execute({
    nik: String(formData.get("nik") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!result.ok) return { error: result.error };

  redirect(result.destination);
}

export async function logout() {
  await container.signOut.execute();
  redirect("/login");
}

export async function updateSessionStatus() {
  const outcome = await container.refreshSession.execute();
  if (outcome.status === "no-session") redirect("/login");
  if (outcome.status === "user-missing") redirect("/api/session/clear");

  redirect(outcome.isGuest ? "/waiting" : "/dashboard");
}

export async function extendSession() {
  const outcome = await container.refreshSession.execute();
  return { success: outcome.status === "refreshed" };
}
