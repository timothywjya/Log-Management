import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import ResetPasswordClient from "./ResetPasswordClient";

export default async function ResetPasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { nik: session.nik },
    select: { id: true, first_name: true, must_reset_password: true },
  });

  if (!user) redirect("/login");
  // Jika tidak wajib reset, langsung ke dashboard
  if (!user.must_reset_password) redirect("/dashboard");

  return <ResetPasswordClient userId={user.id} firstName={user.first_name ?? ""} />;
}
