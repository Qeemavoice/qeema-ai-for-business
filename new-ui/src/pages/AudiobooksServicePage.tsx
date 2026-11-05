import React from 'react';
import { COMMERCIAL_SERVICES } from '../data/commercialServicesData';
import { CommercialServiceTemplate } from './CommercialServiceTemplate';

export const AudiobooksServicePage: React.FC = () => {
  return <CommercialServiceTemplate data={COMMERCIAL_SERVICES['audiobooks']} />;
};
