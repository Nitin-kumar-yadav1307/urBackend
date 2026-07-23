import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, CheckCircle, ArrowLeft, Github, Code, Rocket, FileJson, Server, Smartphone, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

const TEMPLATES = [
  {
    id: 'react-sdk-demo',
    name: 'React SDK Demo',
    description: 'A modern React app showcasing @urbackend/react authentication components (UrAuth, ProtectedRoute, useUser) with full login/signup flow.',
    icon: <Smartphone size={28} />,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    sdk: '@urbackend/react',
    language: 'TypeScript',
    features: ['Social Auth', 'Protected Routes', 'User Profile'],
    deployUrl: 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeturbackend%2FurBackend%2Ftree%2Fmain%2Fexamples%2Freact-sdk-demo&env=VITE_URBACKEND_PK&project-name=urbackend-react-demo&repository-name=urbackend-react-demo',
    repoUrl: 'https://github.com/geturbackend/urBackend/tree/main/examples/react-sdk-demo',
    readme: `# React SDK Demo

A minimal React app demonstrating \`@urbackend/react\` components.

## Setup
\`\`\`bash
git clone https://github.com/geturbackend/urBackend.git
cd urBackend/examples/react-sdk-demo
npm install
\`\`\`

1. Copy \`VITE_URBACKEND_PK\` from your project's API keys
2. Run \`npm run dev\` to start the development server
`
  },
  {
    id: 'sdk-kanban',
    name: 'Kanban Board',
    description: 'Full-featured Kanban board with drag-and-drop tasks, team collaboration, and email notifications via the urBackend Mail module.',
    icon: <LayoutGrid size={28} />,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    sdk: '@urbackend/sdk',
    language: 'JavaScript',
    features: ['CRUD Operations', 'Drag & Drop', 'Email Notifications'],
    deployUrl: 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeturbackend%2FurBackend%2Ftree%2Fmain%2Fexamples%2Fsdk-kanban%2Fclient&env=VITE_URBACKEND_PK&project-name=urbackend-kanban&repository-name=urbackend-kanban',
    repoUrl: 'https://github.com/geturbackend/urBackend/tree/main/examples/sdk-kanban',
    readme: `# Kanban Board

A Kanban board app using \`@urbackend/sdk\` for data and auth.

## Setup

### Option 1: Full Clone
\`\`\`bash
git clone https://github.com/geturbackend/urBackend.git
cd urBackend/examples/sdk-kanban
\`\`\`

### Option 2: Sparse Checkout (Recommended)
Clone only this template folder without downloading the entire repository:
\`\`\`bash
# Clone repository without files
git clone --no-checkout --depth 1 https://github.com/geturbackend/urBackend.git sdk-kanban
cd sdk-kanban

# Enable sparse-checkout
git sparse-checkout init --cone

# Checkout only the kanban template folder
git sparse-checkout set examples/sdk-kanban

# Download the files
git checkout main
\`\`\`

1. Enable Auth in your urBackend project
2. Create collections with RLS:
   - \`boards\`: \`name\` (String, Required), \`ownerId\` (String, Required). Mode: \`private\`, ownerField: \`ownerId\`
   - \`tasks\`: \`title\` (String, Required), \`description\` (String), \`status\` (String, Default: \`Todo\`), \`boardId\` (String, Required), \`ownerId\` (String, Required). Mode: \`private\`, ownerField: \`ownerId\`
3. Configure environment variables:
   - Copy \`server/.env.example\` to \`server/.env\` and set \`URBACKEND_SECRET_KEY=sk_live_...\`
   - Copy \`client/.env.example\` to \`client/.env\` and set \`VITE_URBACKEND_PK=pk_live_...\`
   - Note: Vite-loaded environment changes require restarting the client server
4. Run the application:
   \`\`\`bash
   # Terminal 1: Start server
   cd server && npm install && npm start

   # Terminal 2: Start client (from sdk-kanban folder)
   cd client && npm install && npm run dev
   \`\`\`
`
  },
  {
    id: 'social-demo',
    name: 'Social Media (X Clone)',
    description: 'A Twitter/X.com clone with infinite scroll, multi-image uploads, social graphs (follow/unfollow), likes, comments, and dark mode.',
    icon: <Rocket size={28} />,
    color: '#1DA1F2',
    bgColor: 'rgba(29, 161, 242, 0.1)',
    sdk: '@urbackend/sdk',
    language: 'JavaScript',
    features: ['Social Auth', 'Image Uploads', 'Infinite Scroll'],
    deployUrl: 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeturbackend%2FurBackend%2Ftree%2Fmain%2Fexamples%2Fsocial-demo%2Fclient&env=VITE_PUBLIC_KEY&project-name=urbackend-social-demo&repository-name=urbackend-social-demo',
    repoUrl: 'https://github.com/geturbackend/urBackend/tree/main/examples/social-demo',
    readme: `# Social Media Clone

A full Twitter/X.com clone built on urBackend.

## Setup
1. Enable Auth with GitHub/Google social login
2. Create required collections: \`posts\`, \`profiles\`, \`comments\`, \`likes\`, \`follows\`
3. Configure RLS for each collection
4. Deploy or run locally.
`
  },
  {
    id: 'python-sdk-demo',
    name: 'Python SDK Demo',
    description: 'A complete Python CLI demo showcasing all urbackend Python SDK capabilities: auth, database CRUD, file storage, and email.',
    icon: <Code size={28} />,
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    sdk: 'urbackend (Python)',
    language: 'Python',
    features: ['Auth', 'Database CRUD', 'Storage', 'Mail'],
    deployUrl: null,
    repoUrl: 'https://github.com/geturbackend/urBackend/tree/main/examples/python-sdk-demo',
    readme: `# Python SDK Demo

A CLI-based demo of the urbackend Python SDK.

## Setup
\`\`\`bash
git clone https://github.com/geturbackend/urBackend.git
cd urBackend/examples/python-sdk-demo

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python main.py
\`\`\`
`
  },
  {
    id: 'quickstart-ts',
    name: 'TypeScript Quickstart',
    description: 'Scaffold a new TypeScript project with @urbackend/sdk in seconds using our CLI quickstart script.',
    icon: <FileJson size={28} />,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    sdk: '@urbackend/sdk',
    language: 'TypeScript',
    features: ['CLI Scaffold', 'TypeScript', 'Vercel Ready'],
    deployUrl: 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeturbackend%2FurBackend%2Ftree%2Fmain%2Fexamples%2Freact-sdk-demo&env=VITE_URBACKEND_PK&project-name=urbackend-ts-quickstart&repository-name=urbackend-ts-quickstart',
    repoUrl: 'https://github.com/geturbackend/urBackend/tree/main/examples/quickstart-scripts',
    readme: `# TypeScript Quickstart

\`\`\`bash
bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-ts-sdk.sh)
\`\`\`

Scaffolds a complete TypeScript project with the urBackend SDK pre-configured.
`
  },
  {
    id: 'quickstart-python',
    name: 'Python Quickstart',
    description: 'Scaffold a new Python project with the urbackend SDK using our quickstart script.',
    icon: <Server size={28} />,
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    sdk: 'urbackend (Python)',
    language: 'Python',
    features: ['CLI Scaffold', 'Python 3.9+', 'Vercel Ready'],
    deployUrl: null,
    repoUrl: 'https://github.com/geturbackend/urBackend/tree/main/examples/quickstart-scripts',
    readme: `# Python Quickstart

\`\`\`bash
bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-python-sdk.sh)
\`\`\`

Scaffolds a complete Python project with the urbackend SDK pre-configured.
`
  }
];

function Templates() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [selectedSdk, setSelectedSdk] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sdks = ['all', ...new Set(TEMPLATES.map(t => t.sdk))];

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesSdk = selectedSdk === 'all' || t.sdk === selectedSdk;
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sdk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSdk && matchesSearch;
  });

  const copyQuickstart = (template) => {
    const cmd = template.language === 'Python'
      ? `bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-python-sdk.sh)`
      : `bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-ts-sdk.sh)`;
   navigator.clipboard.writeText(cmd)
     .then(() => toast.success('Quickstart command copied!'))
      .catch(() => toast.error('Failed to copy command'));
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-ghost"
        style={{ marginBottom: '1.5rem', paddingLeft: 0, color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={18} style={{ marginRight: '5px' }} /> Back to Dashboard
      </button>

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
          Project Templates
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', margin: 0, maxWidth: '600px' }}>
          Jumpstart your development with ready-to-use templates. Each template demonstrates different urBackend SDK features.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-input)', color: 'var(--color-text-main)' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {sdks.map(sdk => (
            <button
              key={sdk}
              onClick={() => setSelectedSdk(sdk)}
              className={`btn ${selectedSdk === sdk ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500 }}
            >
              {sdk === 'all' ? 'All SDKs' : sdk}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            role="button"
            tabIndex={0}
            style={{
              background: 'var(--color-bg-card)',
              border: `1px solid ${expandedId === template.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExpandedId(expandedId === template.id ? null : template.id);
              }
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: template.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: template.color,
                flexShrink: 0
              }}>
                {template.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {template.name}
                </h3>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {template.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, background: template.bgColor, color: template.color }}>
                {template.sdk}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
                {template.language}
              </span>
              {template.features.map(f => (
                <span key={f} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 400, background: 'rgba(var(--color-primary-rgb), 0.08)', color: 'var(--color-primary)' }}>
                  {f}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {template.deployUrl && (
                <a
                  href={template.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Rocket size={16} />
                  Deploy to Vercel
                </a>
              )}
              <a
                href={template.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={16} />
                View Source
              </a>
              {(template.id.startsWith('quickstart')) && (
                <button
                  onClick={(e) => { e.stopPropagation(); copyQuickstart(template); }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Copy size={16} />
                  Copy Command
                </button>
              )}
            </div>

            {/* Expanded README */}
            {expandedId === template.id && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6
              }}>
                <pre style={{
                  background: 'var(--color-bg-input)',
                  padding: '1rem',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--color-text-main)',
                  margin: 0
                }}>
                  {template.readme}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>No templates match your search criteria.</p>
        </div>
      )}

      {/* Quickstart Section */}
      <div style={{
        marginTop: '4rem',
        padding: '2rem',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--color-text-main)' }}>
          🚀 Quickstart from Terminal
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Scaffold a new urBackend project without leaving your terminal:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-bg-input)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>TypeScript</div>
            <code style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--color-primary)' }}>
              {`bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-ts-sdk.sh)`}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-ts-sdk.sh)')
                .then(() => toast.success('Command copied!'))
                .catch(() => toast.error('Failed to copy'))}
              className="btn btn-ghost"
              style={{ marginTop: '0.5rem', padding: '4px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Copy size={14} /> Copy
            </button>
          </div>
          <div style={{ padding: '1rem', background: 'var(--color-bg-input)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Python</div>
            <code style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--color-primary)' }}>
              {`bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-python-sdk.sh)`}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('bash <(curl -fsSL https://raw.githubusercontent.com/geturbackend/urBackend/main/examples/quickstart-scripts/setup-python-sdk.sh)')
                .then(() => toast.success('Command copied!'))
                .catch(() => toast.error('Failed to copy'))}
              className="btn btn-ghost"
              style={{ marginTop: '0.5rem', padding: '4px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Templates;