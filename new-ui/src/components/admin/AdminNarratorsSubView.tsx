import React from 'react';
import { AdminNarratorsView } from './AdminNarratorsView';
import { AdminSamplesView } from './AdminSamplesView';

interface Props {
  onNavigateToClaim?: (token: string) => void;
  /** Which page to show: the admin sidebar opens "معلقين صوتيين" and "العينات" separately */
  view?: 'narrators' | 'samples';
  onOpenSamples?: () => void;
}

export const AdminNarratorsSubView: React.FC<Props> = ({ onNavigateToClaim, view = 'narrators', onOpenSamples }) =>
  view === 'samples' ? <AdminSamplesView /> : <AdminNarratorsView onNavigateToClaim={onNavigateToClaim} onOpenSamples={onOpenSamples} />;
