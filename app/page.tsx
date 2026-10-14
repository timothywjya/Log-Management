import { redirect } from "next/navigation";

// proxy.ts sudah mengarahkan "/" sesuai status login; ini hanya fallback.
export default function Home() {
  redirect("/dashboard");
}
