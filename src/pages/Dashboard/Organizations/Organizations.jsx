import React from 'react';
import './organizations.css';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';

function Organizations() {
  return <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>Organizations</FeatureFlag>;
}

export default Organizations;
