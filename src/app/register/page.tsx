import { container } from "@/infrastructure/container";
import { Register } from "@/presentation/components/layouts/register";
import { notFound } from "next/navigation";

export default async function RegisterPage() {
  const outcome = await container.getSessionUser.execute();
  if (outcome.status !== "ok") {
    notFound();
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 overflow-hidden">
      <Register nikFromSession={outcome.user.nik} />
    </div>
  );
}
