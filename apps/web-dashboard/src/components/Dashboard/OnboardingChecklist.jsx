import React from 'react';
import { CheckCircle2, Circle, PartyPopper } from 'lucide-react';

const OnboardingChecklist = ({ projectsCount = 0, activityCount = 0 }) => {
  const steps = [
    { id: 1, label: 'Create an account', completed: true },
    { id: 2, label: 'Create project', completed: projectsCount > 0 },
    { id: 3, label: 'Add collection', completed: projectsCount > 0 },
    { id: 4, label: 'API request', completed: activityCount > 0 },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const isFullyCompleted = completedCount === steps.length;

  if (isFullyCompleted && projectsCount > 2) return null;

  return (
    <div className="glass-card" style={{ 
      padding: '1rem', 
      borderRadius: '8px',
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '0.75rem', fontWeight: 600 }}>Getting Started</h4>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{completedCount}/{steps.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {steps.map(step => (
          <div key={step.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.7rem',
            color: step.completed ? 'var(--color-text-main)' : 'var(--color-text-muted)',
          }}>
            {step.completed ? (
              <CheckCircle2 size={12} color="var(--color-primary)" />
            ) : (
              <Circle size={12} />
            )}
            <span style={{ textDecoration: step.completed ? 'line-through' : 'none', opacity: step.completed ? 0.5 : 1 }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingChecklist;
