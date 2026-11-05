import React from 'react';
import { COMMERCIAL_SERVICES } from '../data/commercialServicesData';
import { CommercialServiceTemplate } from './CommercialServiceTemplate';

export const SaudiVoiceOverPage: React.FC = () => {
  return <CommercialServiceTemplate data={COMMERCIAL_SERVICES['saudi-voice-over']} />;
};
