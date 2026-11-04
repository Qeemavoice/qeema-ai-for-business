/** Google sign-in through Google Identity Services (popup). Needs VITE_GOOGLE_CLIENT_ID in .env. */
const CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SRC = 'https://accounts.google.com/gsi/client';

export const googleConfigured = Boolean(CLIENT_ID);

const loadScript = () => new Promise<void>((resolve, reject) => {
  if ((window as any).google?.accounts) return resolve();
  const s = document.createElement('script');
  s.src = SRC; s.async = true;
  s.onload = () => resolve();
  s.onerror = () => reject(new Error('تعذر تحميل خدمة Google'));
  document.head.appendChild(s);
});

/** Opens Google's popup and returns an access token; the server verifies it with Google (POST /api/v1/auth/google) */
export async function getGoogleAccessToken(): Promise<string> {
  if (!CLIENT_ID) throw new Error('تسجيل الدخول عبر Google غير مفعّل بعد (يحتاج Google Client ID).');
  await loadScript();
  return new Promise<string>((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      callback: (r: any) => (r.access_token ? resolve(r.access_token) : reject(new Error('تم إلغاء تسجيل الدخول'))),
      error_callback: () => reject(new Error('تم إلغاء تسجيل الدخول')),
    });
    client.requestAccessToken();
  });
}
