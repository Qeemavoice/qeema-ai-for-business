import nodemailer from 'nodemailer';
import { db } from './db/store';

/** SMTP from the dashboard (الإعدادات ← البريد) or, when empty there, from SMTP_* in .env.local */
const smtpConfig = () => {
  const s = db.integrations.smtp;
  if (s.host) return { host: s.host, port: s.port, secure: s.encryption === 'SSL', user: s.username, pass: s.password, from: `${s.fromName} <${s.fromAddress}>` };
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: process.env.SMTP_SECURE !== 'false',
      user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '', from: process.env.SMTP_FROM || 'Qeemavoice <info@qeemavoice.com>'
    };
  }
  return null;
};

export const mailConfigured = () => Boolean(smtpConfig());

export async function sendMail(to: string, subject: string, text: string) {
  const c = smtpConfig();
  if (!c) throw new Error('إرسال البريد غير مفعّل: اضبط بيانات SMTP في لوحة الإدارة');
  const transport = nodemailer.createTransport({ host: c.host, port: c.port, secure: c.secure, auth: c.user ? { user: c.user, pass: c.pass } : undefined });
  await transport.sendMail({ from: c.from, to, subject, text });
}
