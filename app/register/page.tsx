import { Register } from "@/components/layouts/register";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();

  if (!session || !session.nik) {
    notFound(); 
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 overflow-hidden">
      <Register nikFromSession={session!.nik} />
    </div>
  );
}