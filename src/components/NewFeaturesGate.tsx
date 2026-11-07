import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRowad } from '../lib/rowad';

/** Credits, plans, top-up and TTS pages: Rowad members now, everyone from the public launch; others go to the waitlist. */
export const NewFeaturesGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { canUse, ready } = useRowad();
  if (canUse) return <>{children}</>;
  if (!ready) return null;   // the signed-in account is still loading: do not send a member away
  return <Navigate to="/ar/waitlist" replace />;
};
