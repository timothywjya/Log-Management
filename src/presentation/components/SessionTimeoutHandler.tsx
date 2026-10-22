"use client";

import { extendSession, logout } from "@/presentation/actions/auth";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const PUBLIC_PATHS = ["/login", "/register"];
const WARNING_TIME = 55 * 60 * 1000; // peringatan di menit ke-55 (sesi 1 jam)

export default function SessionTimeoutHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);
  // Kapan sesi dimulai/diperpanjang terakhir. Berpindah halaman TIDAK me-reset ini
  // karena umur cookie juga tidak ter-reset saat berpindah halaman.
  const startedAt = useRef<number | null>(null);
  // Naik setiap sesi diperpanjang -> timer dipasang ulang. Sebelumnya timer hanya
  // dipasang sekali, jadi setelah "Ya, Teruskan" peringatan berikutnya tidak pernah muncul.
  const [resetKey, setResetKey] = useState(0);

  const handleLogout = useCallback(async () => {
    Swal.close();
    await logout(); // server action redirect ke /login
    router.refresh();
  }, [router]);

  const handleExtend = useCallback(async () => {
    const res = await extendSession();
    if (res.success) {
      startedAt.current = Date.now();
      setResetKey((k) => k + 1);
      Swal.fire({
        title: "Berhasil!",
        text: "Sesi Anda telah diperpanjang 1 jam ke depan.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "rounded-[2.5rem]" },
      });
    } else {
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    // Tidak ada sesi di halaman login/register, jadi tidak perlu timer.
    if (isPublic) {
      startedAt.current = null;
      return;
    }
    if (startedAt.current === null) startedAt.current = Date.now();
    const delay = Math.max(0, WARNING_TIME - (Date.now() - startedAt.current));

    const timeout = setTimeout(() => {
      let timerInterval: ReturnType<typeof setInterval>;

      Swal.fire({
        title: "Sesi Hampir Habis!",
        html: "Sesi Anda akan berakhir dalam <b>60</b> detik.<br/>Ingin melanjutkan?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1db495",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Ya, Teruskan",
        cancelButtonText: "Logout",
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 60000,
        timerProgressBar: true,
        customClass: { popup: "rounded-[2.5rem]" },
        didOpen: () => {
          const b = Swal.getHtmlContainer()?.querySelector("b");
          timerInterval = setInterval(() => {
            if (b) b.textContent = Math.ceil(Number(Swal.getTimerLeft()) / 1000).toString();
          }, 100);
        },
        willClose: () => clearInterval(timerInterval),
      }).then((result) => {
        if (result.isConfirmed) {
          handleExtend();
        } else if (
          result.dismiss === Swal.DismissReason.cancel ||
          result.dismiss === Swal.DismissReason.timer
        ) {
          handleLogout();
        }
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [isPublic, resetKey, handleExtend, handleLogout]);

  return null;
}
