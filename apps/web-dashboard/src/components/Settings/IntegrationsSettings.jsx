import React, { useState, useEffect } from 'react';
import {
    Database, Shield, Mail, HardDrive, Check, Copy, Server
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PUBLIC_API_URL } from '../../config';
import { FormField } from './formPrimitives';
import { inputStyle } from '../../utils/styles';
import DatabaseConfigForm from './DatabaseConfigForm';
import StorageConfigForm from './StorageConfigForm';
import MailTemplatesForm from './MailTemplatesForm';

function IntegrationSectionCard({ title, description, icon: Icon, iconColor = 'var(--color-primary)', accentColor, children, style = {} }) {
    return (
        <div className="glass-card" style={{ borderRadius: '8px', position: 'relative', overflow: 'hidden', ...style }}>
            {accentColor && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: accentColor }} />
            )}
            <div style={{ padding: '1.25rem', paddingLeft: accentColor ? '1.5rem' : '1.25rem' }}>
                {title && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {Icon && <Icon size={18} color={iconColor} />}
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{title}</h3>
                        </div>
                        {description && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                                {description}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

export default function IntegrationsSettings({
    project,
    projectId,
    onProjectUpdate,
    role,
    hasResendKey,
    resendKeyValue,
    setResendKeyValue,
    resendFromEmailValue,
    setResendFromEmailValue,
    resendKeyLoading,
    handleResendKeySave,
}) {
    const isViewer = role === 'viewer';

    // Auth Providers State
    const [authProviders, setAuthProviders] = useState({
        github: { enabled: false, clientId: '', clientSecret: '', hasClientSecret: false },
        google: { enabled: false, clientId: '', clientSecret: '', hasClientSecret: false }
    });
    const [isSavingProviders, setIsSavingProviders] = useState(false);
    const [activeAuthTab, setActiveAuthTab] = useState('github');
    const [copiedUrl, setCopiedUrl] = useState(null);

    const siteUrl = project?.siteUrl || '';
    const githubCallbackUrl = `${PUBLIC_API_URL}/api/userAuth/social/github/callback`;
    const googleCallbackUrl = `${PUBLIC_API_URL}/api/userAuth/social/google/callback`;

    useEffect(() => {
        if (project?.authProviders) {
            const providers = project.authProviders;
            Promise.resolve().then(() => setAuthProviders(providers));
        }
    }, [project?.authProviders]);

    const handleProviderFieldChange = (provider, field, value) => {
        setAuthProviders((prev) => ({
            ...prev,
            [provider]: { ...prev[provider], [field]: value }
        }));
    };

    const handleSaveProviders = async () => {
        setIsSavingProviders(true);
        try {
            const payload = {
                github: {
                    enabled: !!authProviders.github.enabled,
                    clientId: authProviders.github.clientId,
                    ...(authProviders.github.clientSecret ? { clientSecret: authProviders.github.clientSecret } : {})
                },
                google: {
                    enabled: !!authProviders.google.enabled,
                    clientId: authProviders.google.clientId,
                    ...(authProviders.google.clientSecret ? { clientSecret: authProviders.google.clientSecret } : {})
                }
            };
            const res = await api.patch(`/api/projects/${projectId}/auth/providers`, payload);
            setAuthProviders(res.data.authProviders);
            if (onProjectUpdate) {
                onProjectUpdate(prev => ({ ...prev, authProviders: res.data.authProviders }));
            }
            toast.success('Auth provider settings saved!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save auth provider settings');
        } finally {
            setIsSavingProviders(false);
        }
    };

    const copyToClipboard = async (text, type) => {
        if (!navigator?.clipboard) {
            toast.error('Clipboard access is not available.');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            setCopiedUrl(type);
            toast.success('Callback URL copied!');
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch {
            toast.error('Failed to copy to clipboard.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 1. DATABASES SECTION */}
            <IntegrationSectionCard
                title="Databases"
                description="Manage primary & caching databases for your project context."
                icon={Database}
                iconColor="var(--color-primary)"
                accentColor="var(--color-primary)"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Primary MongoDB */}
                    <DatabaseConfigForm project={project} projectId={projectId} onProjectUpdate={onProjectUpdate} role={role} />

                    {/* Redis (Coming Soon) */}
                    <div className="glass-card" style={{ padding: '1rem', borderRadius: '8px', border: '1px dashed var(--color-border)', opacity: 0.7 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Server size={16} color="#ef4444" />
                                <div>
                                    <h4 style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>Redis Cache</h4>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                                        High performance memory cache & pub/sub engine.
                                    </p>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.68rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                                Coming Soon
                            </span>
                        </div>
                    </div>
                </div>
            </IntegrationSectionCard>

            {/* 2. AUTH INTEGRATIONS SECTION */}
            <IntegrationSectionCard
                title="Authentication Providers"
                description="Enable third-party social logins (GitHub, Google OAuth) for your public users."
                icon={Shield}
                iconColor="#3b82f6"
                accentColor="#3b82f6"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Site URL warning check */}
                    {!siteUrl && (
                        <div style={{ padding: '10px 12px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '6px', fontSize: '0.75rem', color: '#eab308' }}>
                            ⚠️ <strong>Site URL is not set:</strong> Please set your app's frontend URL in the <em>General Settings</em> so OAuth redirects to <code>/auth/callback</code> correctly.
                        </div>
                    )}

                    {/* Auth Provider Selector Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '8px' }}>
                        {[
                            { id: 'github', label: 'GitHub OAuth', enabled: authProviders.github.enabled, configured: authProviders.github.hasClientSecret },
                            { id: 'google', label: 'Google OAuth', enabled: authProviders.google.enabled, configured: authProviders.google.hasClientSecret }
                        ].map((prov) => (
                            <button
                                key={prov.id}
                                onClick={() => setActiveAuthTab(prov.id)}
                                style={{
                                    padding: '8px 14px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: activeAuthTab === prov.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    color: activeAuthTab === prov.id ? '#fff' : 'var(--color-text-muted)',
                                    fontSize: '0.8rem',
                                    fontWeight: activeAuthTab === prov.id ? 600 : 400,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>{prov.label}</span>
                                {prov.enabled && (
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Active Provider Form */}
                    {activeAuthTab === 'github' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>GitHub OAuth Integration</h4>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                                        Allow users to log in with their GitHub account.
                                    </p>
                                </div>
                                <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!authProviders.github.enabled}
                                        onChange={(e) => handleProviderFieldChange('github', 'enabled', e.target.checked)}
                                        disabled={isViewer}
                                    />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: authProviders.github.enabled ? '#22c55e' : 'var(--color-text-muted)' }}>
                                        {authProviders.github.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </label>
                            </div>

                            <FormField label="Authorization Callback URL (Read-only)" hint="Add this exact URL into your GitHub Developer Application settings.">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        readOnly
                                        value={githubCallbackUrl}
                                        style={{ ...inputStyle, fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-muted)' }}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Copy GitHub callback URL"
                                        className="btn btn-secondary"
                                        onClick={() => copyToClipboard(githubCallbackUrl, 'github')}
                                        style={{ height: '32px', fontSize: '0.75rem', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        {copiedUrl === 'github' ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </FormField>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <FormField label="Client ID">
                                    <input
                                        type="text"
                                        placeholder="e.g. Ov23li..."
                                        value={authProviders.github.clientId || ''}
                                        onChange={(e) => handleProviderFieldChange('github', 'clientId', e.target.value)}
                                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                                        disabled={isViewer}
                                    />
                                </FormField>

                                <FormField
                                    label={
                                        <span>
                                            Client Secret{' '}
                                            <span style={{ fontSize: '0.65rem', color: authProviders.github.hasClientSecret ? '#22c55e' : '#f97316' }}>
                                                • {authProviders.github.hasClientSecret ? 'Configured (encrypted)' : 'Not set'}
                                            </span>
                                        </span>
                                    }
                                >
                                    <input
                                        type="password"
                                        placeholder={authProviders.github.hasClientSecret ? '••••••••••••••••' : 'Enter client secret'}
                                        value={authProviders.github.clientSecret || ''}
                                        onChange={(e) => handleProviderFieldChange('github', 'clientSecret', e.target.value)}
                                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                                        disabled={isViewer}
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {activeAuthTab === 'google' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Google OAuth Integration</h4>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                                        Allow users to log in with Google accounts.
                                    </p>
                                </div>
                                <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!authProviders.google.enabled}
                                        onChange={(e) => handleProviderFieldChange('google', 'enabled', e.target.checked)}
                                        disabled={isViewer}
                                    />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: authProviders.google.enabled ? '#22c55e' : 'var(--color-text-muted)' }}>
                                        {authProviders.google.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </label>
                            </div>

                            <FormField label="Authorized Redirect URI (Read-only)" hint="Add this exact URI into your Google Cloud Console OAuth 2.0 Credentials.">
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        readOnly
                                        value={googleCallbackUrl}
                                        style={{ ...inputStyle, fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text-muted)' }}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Copy Google redirect URI"
                                        className="btn btn-secondary"
                                        onClick={() => copyToClipboard(googleCallbackUrl, 'google')}
                                        style={{ height: '32px', fontSize: '0.75rem', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        {copiedUrl === 'google' ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                                    </button>
                                </div>
                            </FormField>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <FormField label="Client ID">
                                    <input
                                        type="text"
                                        placeholder="e.g. 12345-abc.apps.googleusercontent.com"
                                        value={authProviders.google.clientId || ''}
                                        onChange={(e) => handleProviderFieldChange('google', 'clientId', e.target.value)}
                                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                                        disabled={isViewer}
                                    />
                                </FormField>

                                <FormField
                                    label={
                                        <span>
                                            Client Secret{' '}
                                            <span style={{ fontSize: '0.65rem', color: authProviders.google.hasClientSecret ? '#22c55e' : '#f97316' }}>
                                                • {authProviders.google.hasClientSecret ? 'Configured (encrypted)' : 'Not set'}
                                            </span>
                                        </span>
                                    }
                                >
                                    <input
                                        type="password"
                                        placeholder={authProviders.google.hasClientSecret ? '••••••••••••••••' : 'Enter client secret'}
                                        value={authProviders.google.clientSecret || ''}
                                        onChange={(e) => handleProviderFieldChange('google', 'clientSecret', e.target.value)}
                                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                                        disabled={isViewer}
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {!isViewer && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button
                                onClick={handleSaveProviders}
                                className="btn btn-primary"
                                disabled={isSavingProviders}
                                style={{ height: '30px', fontSize: '0.75rem', padding: '0 14px' }}
                            >
                                {isSavingProviders ? 'Saving Auth Settings...' : 'Save Auth Settings'}
                            </button>
                        </div>
                    )}
                </div>
            </IntegrationSectionCard>

            {/* 3. MAIL INTEGRATIONS SECTION */}
            <IntegrationSectionCard
                title="Mail & Templates"
                description="Configure transactional email delivery providers and customize email templates."
                icon={Mail}
                iconColor="#c084fc"
                accentColor="#a855f7"
                style={{ borderColor: 'rgba(168,85,247,0.2)' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Provider Selection Info */}
                    <div style={{ padding: '10px 12px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c084fc' }}>Active Provider: Resend.com (BYOK)</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                                SendGrid, AWS SES & urMail Engine support are in development.
                            </span>
                        </div>
                    </div>

                    {/* Resend BYOK Card */}
                    <div className="glass-card" style={{ padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px 0' }}>Resend.com API Key</h4>
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                            Upload a per-project Resend API key to send mail from your custom domain.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <FormField label={
                                <span>
                                    Resend API Key{' '}
                                    <span style={{ fontWeight: 600, color: hasResendKey ? '#22c55e' : '#f97316', fontSize: '0.65rem' }}>
                                        · {hasResendKey ? 'Configured' : 'Not configured'}
                                    </span>
                                </span>
                            }>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="re_123456789..."
                                    value={resendKeyValue}
                                    onChange={(e) => setResendKeyValue(e.target.value)}
                                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                                    disabled={isViewer}
                                />
                            </FormField>
                            <FormField label="Default From Address" hint={<>Blank defaults to <code>onboarding@resend.dev</code></>}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Acme <info@acme.com>"
                                    value={resendFromEmailValue}
                                    onChange={(e) => setResendFromEmailValue(e.target.value)}
                                    style={inputStyle}
                                    disabled={isViewer}
                                />
                            </FormField>
                        </div>
                        {!isViewer && (
                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleResendKeySave}
                                    className="btn btn-primary"
                                    disabled={resendKeyLoading || (!resendKeyValue.trim() && resendFromEmailValue.trim() === (project?.resendFromEmail || ""))}
                                    style={{ height: '30px', fontSize: '0.75rem', padding: '0 14px' }}
                                >
                                    {resendKeyLoading ? "Saving..." : "Save Mail Settings"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mail Templates Sub-form */}
                    <MailTemplatesForm projectId={projectId} role={role} />
                </div>
            </IntegrationSectionCard>

            {/* 4. STORAGE INTEGRATIONS SECTION */}
            <IntegrationSectionCard
                title="Storage Engine (BYOS)"
                description="Connect external storage providers for public & private file bucket uploads."
                icon={HardDrive}
                iconColor="#34d399"
                accentColor="#34d399"
            >
                <StorageConfigForm project={project} projectId={projectId} onProjectUpdate={onProjectUpdate} role={role} />
            </IntegrationSectionCard>

        </div>
    );
}
