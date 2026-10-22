"use server";

import { container } from "@/infrastructure/container";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const outcome = await container.completeProfile.execute({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  });

  switch (outcome.status) {
    case "no-session":
      redirect("/login");
    case "user-missing":
      redirect("/api/session/clear");
    case "invalid":
    case "failed":
      return { error: outcome.error };
    case "saved":
      redirect(outcome.isGuest ? "/waiting" : "/dashboard");
  }
}
