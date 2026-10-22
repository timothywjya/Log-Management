import Sidebar from "@/presentation/components/sidebar";
import { requireUser } from "@/presentation/guards/auth";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />
      <main className="ml-64 p-8 w-full">
        <ProfileClient user={user} />
      </main>
    </div>
  );
}
