import { redirect } from "next/navigation";

// /log langsung diarahkan ke tab pertama.
export default function LogIndexPage() {
  redirect("/log/web");
}
