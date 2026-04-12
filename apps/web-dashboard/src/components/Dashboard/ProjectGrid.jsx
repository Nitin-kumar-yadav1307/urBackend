import React from 'react';
import { Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';

const ProjectGrid = ({ projects, onCreateProject }) => {
  const cardStyle = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}

      {/* Add New Project Card (always visible at end of list) */}
      <button
        onClick={onCreateProject}
        className="dashboard-card-add"
        style={{
          ...cardStyle,
          background: 'transparent',
          borderStyle: 'dashed',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          minHeight: '180px', // Shrunk
          transition: 'all 0.2s'
        }}
      >
        <div style={{ background: 'var(--color-bg-input)', padding: '12px', borderRadius: '50%', marginBottom: '0.75rem', border: '1px solid var(--color-border)' }}>
          <Plus size={18} />
        </div>
        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>New Project</span>
      </button>
    </div>
  );
};

export default ProjectGrid;
