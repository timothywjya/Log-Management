"use client";

import { extendSession, logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import Swal from "sweetalert2";

export default function SessionTimeoutHandler() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await logout();
    Swal.close();
    router.push("/login");
    router.refresh();
  }, [router]);

  const handleExtend = useCallback(async () => {
    const res = await extendSession();
    if (res) {
      Swal.fire({
        title: "Berhasil!",
        text: "Sesi Anda telah diperpanjang 1 jam ke depan.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-[2.5rem]' }
      });
    } else {
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    // 1. Munculkan peringatan pada menit ke-55 (5 menit sebelum 1 jam habis)
    const WARNING_TIME = 55 * 60 * 1000; 

    const timeout = setTimeout(() => {
      let timerInterval: any;

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
        timer: 60000, // Durasi 60 detik untuk menjawab
        timerProgressBar: true,
        customClass: { popup: 'rounded-[2.5rem]' },
        didOpen: () => {
          const b = Swal.getHtmlContainer()?.querySelector('b');
          timerInterval = setInterval(() => {
            if (b) {
              const secondsLeft = Math.ceil(Number(Swal.getTimerLeft()) / 1000);
              b.textContent = secondsLeft.toString();
            }
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then((result: any) => {
        if (result.isConfirmed) {
          handleExtend();
        } else if (
          result.dismiss === Swal.DismissReason.cancel || 
          result.dismiss === Swal.DismissReason.timer
        ) {
          // Jika klik Logout ATAU waktu habis, otomatis keluar
          handleLogout();
        }
      });
    }, WARNING_TIME);

    return () => clearTimeout(timeout);
  }, [handleExtend, handleLogout]);

  return null;
}