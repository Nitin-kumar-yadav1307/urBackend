import React from 'react';
import { Tag } from 'lucide-react';

const ReleaseBadge = () => {
  return (
    <div style={{ 
      marginTop: '2rem', 
      padding: '8px 12px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '8px',
      opacity: 0.4,
      fontSize: '0.7rem'
    }}>
      <Tag size={10} />
      <span>urBackend v0.8.0-beta</span>
    </div>
  );
};

export default ReleaseBadge;
