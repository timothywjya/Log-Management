"use server";

import { registerProfile } from "@/lib/controllers/user.controller";
import { redirect } from "next/navigation";

export async function submitRegistration(formData: FormData) {
  const result = await registerProfile(formData);
  if (result.error) return { error: result.error };
  redirect("/waiting");
}
