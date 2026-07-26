import React from 'react';
import { Settings, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const SocialAuthConfig = ({ authProviders, onOpenModal, setSelectedProvider }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <Settings size={16} color="var(--color-primary)" /> Social Authentication
          </h3>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Configure third-party login providers for your application.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/project/${projectId}/settings?tab=integrations`)}
            style={{ height: '32px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <ExternalLink size={13} />
            Integrations
          </button>
          <button className="btn btn-primary" onClick={onOpenModal} style={{ height: '32px', fontSize: '0.75rem' }}>
            Open Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {[
          { key: 'github', label: 'GitHub', enabled: authProviders.github.enabled, secret: authProviders.github.hasClientSecret },
          { key: 'google', label: 'Google', enabled: authProviders.google.enabled, secret: authProviders.google.hasClientSecret }
        ].map((provider) => (
          <button
            key={provider.key}
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSelectedProvider(provider.key);
              onOpenModal();
            }}
            style={{
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
              <span style={{ color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.8rem' }}>{provider.label}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                {provider.enabled ? 'Active' : 'Disabled'} • {provider.secret ? 'Configured' : 'No Secret'}
              </span>
            </span>
            <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600 }}>Edit</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialAuthConfig;
