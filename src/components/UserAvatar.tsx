import React from 'react';
import { User } from '../types';

const COLORS = ['#F97316', '#0EA5E9', '#8B5CF6', '#10B981', '#EF4444', '#EAB308', '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F43F5E', '#06B6D4'];

/** Each account gets its own look: its uploaded photo, otherwise its initials on a colour picked from its id/email */
export const UserAvatar: React.FC<{ user: User | null; className?: string }> = ({ user, className = 'w-8 h-8 text-sm' }) => {
  const key = user?.email || user?.id || '';
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const words = (user?.name || key || '؟').trim().split(/\s+/);
  const initials = (words[0]?.[0] || '') + (words.length > 1 ? words[1][0] : '');
  return user?.avatar
    ? <img src={user.avatar} alt="" className={`${className} rounded-full object-cover shrink-0`} />
    : <span className={`${className} rounded-full shrink-0 flex items-center justify-center font-black text-white uppercase`} style={{ background: COLORS[h % COLORS.length] }}>{initials}</span>;
};
