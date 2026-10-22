import { container } from "@/infrastructure/container";
import RequestTable from "@/presentation/components/RequestTable";
import Sidebar from "@/presentation/components/sidebar";
import { requireUser } from "@/presentation/guards/auth";

export default async function RequestMemberPage() {
  const currentUser = await requireUser({ admin: true });
  const { users, roles, groups } = await container.listPendingRequests.execute();

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar user={currentUser} />
      <main className="ml-64 p-8 w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            User <span className="text-[#1db495]">Requests</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Pending approvals for guest accounts</p>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <RequestTable users={users} roles={roles} groups={groups} />
        </div>
      </main>
    </div>
  );
}
