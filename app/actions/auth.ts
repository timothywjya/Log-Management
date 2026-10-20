'use server';

import { toSessionPayload } from '@/lib/auth';
import db from '@/lib/db';
import {
    clearSessionCookie,
    getSession,
    setSessionCookie
} from '@/lib/session';
import { redirect } from 'next/navigation';

interface ESSResponse {
    LoginESS_V2Result: string;
}

const ESS_URL =
    process.env.ESS_URL ||
    'http://ess1.indomaret.lan:8070/LoginESSREST.svc/v2/LoginESS';

async function callESS(
    nik: string,
    password: string
): Promise<ESSResponse | null> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(ESS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: { nik, pass: password } }),
                cache: 'no-store',
                signal: AbortSignal.timeout(8000) // supaya tidak menggantung jika ESS tidak merespons
            });
            if (response.ok) return await response.json();
        } catch {
            // jatuh ke retry
        }
        if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 1000));
    }

    console.error('ESS connection failed after 3 attempts');
    return null;
}

export async function authenticate(formData: FormData) {
    const nik = String(formData.get('nik') ?? '');
    const password = String(formData.get('password') ?? '');

    if (!/^\d{10}$/.test(nik) || !password) {
        return { error: 'NIK (10 digit) dan Password wajib diisi.' };
    }

    const responseData = await callESS(nik, password);
    const essResult = responseData?.LoginESS_V2Result;

    // if (essResult !== "Sukses") {
    //   return { error: essResult || "Gagal terhubung ke server ESS. Silakan coba lagi." };
    // }

    let destination = '/dashboard';

    try {
        const existing = await db.user.findUnique({ where: { nik } });

        // Akun yang dinonaktifkan admin tidak boleh login lagi.
        if (existing?.deleted_at) {
            return {
                error: 'Akun Anda sudah dinonaktifkan. Hubungi administrator.'
            };
        }

        const user = existing
            ? await db.user.update({
                  where: { nik },
                  data: { login_at: new Date() }
              })
            : await db.user.create({
                  data: { nik, is_guest: true, login_at: new Date() }
              });

        const payload = toSessionPayload(user);
        await setSessionCookie(payload);

        if (!payload.hasName) destination = '/register';
        else if (user.is_guest) destination = '/waiting';
    } catch (err) {
        // Detail error hanya ke log server, tidak dibocorkan ke browser.
        console.error('Auth error:', err);
        return { error: 'Terjadi kesalahan pada server. Silakan coba lagi.' };
    }

    redirect(destination);
}

export async function logout() {
    await clearSessionCookie();
    redirect('/login');
}

export async function updateSessionStatus() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = await db.user.findFirst({
        where: { nik: session.nik, deleted_at: null }
    });
    if (!user) redirect('/api/session/clear');

    await setSessionCookie(toSessionPayload(user));
    redirect(user.is_guest ? '/waiting' : '/dashboard');
}

export async function extendSession() {
    const session = await getSession();
    if (!session) return { success: false };

    // Payload dibangun ulang dari database, jadi perubahan role & status ikut terbawa
    // dan user yang sudah dinonaktifkan tidak bisa memperpanjang sesi.
    const user = await db.user.findFirst({
        where: { nik: session.nik, deleted_at: null }
    });
    if (!user) return { success: false };

    await setSessionCookie(toSessionPayload(user));
    return { success: true };
}
