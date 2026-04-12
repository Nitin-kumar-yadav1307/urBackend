import React from 'react';
import { Zap } from 'lucide-react';
import UsageProgressBar from './UsageProgressBar';

const UsageQuota = ({ projectsCount = 0, collectionsCount = 0, limits = { maxProjects: 1, maxCollections: 20 } }) => {
  return (
    <div className="glass-card" style={{ 
      padding: '1rem', // Shrunk
      borderRadius: '8px',
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={12} color="#7B61FF" /> Usage Quota
        </h4>
        <span style={{ fontSize: '0.6rem', padding: '1px 5px', background: 'rgba(123, 97, 255, 0.1)', color: '#7B61FF', borderRadius: '3px', fontWeight: 600 }}>
          FREE
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <UsageProgressBar 
            label="Projects" 
            used={projectsCount} 
            limit={limits.maxProjects} 
            unit="Proj"
        />
        <UsageProgressBar 
            label="Collections" 
            used={collectionsCount} 
            limit={limits.maxCollections} 
            unit="Col"
        />
      </div>
    </div>
  );
};

export default UsageQuota;
