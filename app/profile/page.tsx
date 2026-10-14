import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import Sidebar from "@/components/sidebar";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { nik: session!.nik },
    include: { team: true, sub_team: true, program_group: true },
  });

  if (!user) redirect("/login");
  if (user.is_guest) redirect("/waiting");

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />
      <main className="lg:ml-60 flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-w-0">
        <ProfileClient user={user} />
      </main>
    </div>
  );
}
