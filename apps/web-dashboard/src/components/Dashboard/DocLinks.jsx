import React from 'react';
import { BookOpen, Zap, MessageSquare, Bug, ExternalLink } from 'lucide-react';

const DocLinks = () => {
  const links = [
    { icon: BookOpen, label: 'Docs', href: 'https://docs.ub.bitbros.in/' },
    { icon: Zap, label: 'API', href: 'https://docs.ub.bitbros.in/api-reference/overview' },
    { icon: MessageSquare, label: 'Discord', href: 'https://discord.gg/CXJjvJkNWn' },
    { icon: Bug, label: 'Report Bug', href: 'https://github.com/geturbackend/urBackend/issues' },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1.25rem', 
      alignItems: 'center', 
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.03)'
    }}>
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            color: 'var(--color-text-muted)',
            transition: 'color 0.2s',
            fontSize: '0.75rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
        >
          <link.icon size={12} />
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  );
};

export default DocLinks;
