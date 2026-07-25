import React from 'react';

export function FormField({ label, hint, children }) {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label" style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {label}
                </label>
            )}
            {children}
            {hint && <small style={{ display: 'block', marginTop: '5px', fontSize: '0.68rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{hint}</small>}
        </div>
    );
}

export function SettingsCard({ title, icon: Icon, iconColor, accentColor, children, style = {} }) {
    return (
        <div className="glass-card" style={{ borderRadius: '8px', position: 'relative', overflow: 'hidden', ...style }}>
            {accentColor && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: accentColor }} />
            )}
            <div style={{ padding: '1rem', paddingLeft: accentColor ? '1.25rem' : '1rem' }}>
                {title && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '1rem' }}>
                        {Icon && <Icon size={14} color={iconColor || 'var(--color-primary)'} />}
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{title}</h3>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
