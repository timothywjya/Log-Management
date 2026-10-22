"use server";

import { container } from "@/infrastructure/container";
import { getActionUser } from "@/presentation/guards/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const user = await getActionUser();
  if (!user) return { error: "Sesi tidak valid, silakan login kembali" };

  const result = await container.updateProfile.execute(user.nik, {
    firstName: String(formData.get("first_name") ?? ""),
    lastName: String(formData.get("last_name") ?? ""),
    email: String(formData.get("user_email") ?? ""),
  });
  if (!result.ok) return { error: result.error };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
