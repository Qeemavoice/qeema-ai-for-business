import React from 'react';
import { Voice } from '../types';
import { VoiceLibraryView } from './VoiceLibraryView';

interface HumanMarketplaceViewProps {
  voices: Voice[];
  onSelectForBooking: (voice: Voice) => void;
  onSelectForAITwin: (voice: Voice) => void;
  onOpenDemo?: () => void;
}

/**
 * HumanMarketplaceView:
 * Mirrors the exact same table layout as VoiceLibraryView ('human' tab)
 * with Glassy Orbs (no human photos), Arabic localization, and RTL alignment.
 */
export const HumanMarketplaceView: React.FC<HumanMarketplaceViewProps> = ({
  voices,
  onSelectForBooking,
  onSelectForAITwin,
  onOpenDemo
}) => {
  return (
    <VoiceLibraryView
      voices={voices}
      initialTab="human"
      onSelectForGeneration={(voice: any) => onSelectForAITwin(voice)}
      onSelectForBooking={(voice: any) => onSelectForBooking(voice)}
      onOpenDemo={onOpenDemo}
    />
  );
};
