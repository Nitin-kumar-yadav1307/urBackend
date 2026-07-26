import React from 'react';
import {
  Database,
  HardDrive,
  CheckCircle,
  Lock,
  Activity,
  Smartphone,
  Mail,
  UserRound,
  Github
} from 'lucide-react';

export const APP_SERVICES = [
  {
      id: 'auth',
      title: 'User Authentication',
      badge: 'IDENTITY',
      desc: 'Pre-configured secure login/signup flows, session handling with JWTs, and third-party login providers (GitHub, Google) with zero setup.',
      icon: UserRound,
      color: '#00f5d4',
      visual: (
          <div className="mini-visual auth-visual">
              <div className="mini-auth-box">
                  <div className="mini-auth-header">
                      <div className="mini-circle red"></div>
                      <div className="mini-circle yellow"></div>
                      <div className="mini-circle green"></div>
                  </div>
                  <div className="mini-auth-body">
                      <span className="mini-auth-label">Sign in to App</span>
                      <div className="mini-auth-input">
                          <div className="mini-dot"></div>
                          <span className="placeholder">user@domain.com</span>
                      </div>
                      <div className="mini-auth-btn-row">
                          <button className="mini-auth-btn-primary" type="button">Continue</button>
                      </div>
                      <div className="mini-auth-providers">
                          <div className="mini-provider-btn"><Github size={12} /></div>
                          <div className="mini-provider-btn"><span style={{ fontWeight: 'bold', fontSize: '10px', color: '#fff' }}>G</span></div>
                      </div>
                  </div>
                  <div className="mini-cursor">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="#fff">
                          <path d="M4 2l16 11-8 2 5 7-3 1-5-7-5 2V2z" stroke="#000" strokeWidth="1" />
                      </svg>
                  </div>
              </div>
          </div>
      )
  },
  {
      id: 'db',
      title: 'JSON Document Database',
      badge: 'DATABASE',
      desc: 'Direct database mutations and queries right from your client application. Automated validation schemas protect integrity at high speed.',
      icon: Database,
      color: '#FFBD2E',
      visual: (
          <div className="mini-visual db-visual">
              <div className="mini-db-code">
                  <span className="code-key">const</span> <span className="code-var">user</span> = <span className="code-key">await</span> db.<span className="code-func">find</span>(<span className="code-str">'users'</span>);
                  <div className="code-json">
                      <span className="json-bracket">{"{"}</span>
                      <div style={{ paddingLeft: '10px' }}>
                          <span className="json-key">"id"</span>: <span className="json-val">"usr_9x"</span>,
                          <span className="json-key">"active"</span>: <span className="json-bool">true</span>,
                          <span className="json-key">"role"</span>: <span className="json-str">"member"</span>
                      </div>
                      <span className="json-bracket">{"}"}</span>
                  </div>
              </div>
          </div>
      )
  },
  {
      id: 'storage',
      title: 'Secure File Storage',
      badge: 'STORAGE',
      desc: 'Upload, manage, and deliver media assets like avatars, documents, and videos directly. Integrated with bucket systems and global delivery networks.',
      icon: HardDrive,
      color: '#409EFF',
      visual: (
          <div className="mini-visual storage-visual">
              <div className="mini-storage-panel">
                  <div className="storage-panel-header">
                      <HardDrive size={10} className="storage-header-icon" />
                      <span className="storage-bucket-name">media-uploads</span>
                      <span className="storage-file-count">3 files</span>
                  </div>
                  <div className="storage-file-list">
                      <div className="storage-file-row">
                          <div className="storage-file-type img">IMG</div>
                          <div className="storage-file-info">
                              <span className="storage-fname">avatar.png</span>
                              <span className="storage-fsize">1.4 MB</span>
                          </div>
                          <CheckCircle size={10} className="storage-check" />
                      </div>
                      <div className="storage-file-row">
                          <div className="storage-file-type doc">DOC</div>
                          <div className="storage-file-info">
                              <span className="storage-fname">invoice_q4.pdf</span>
                              <span className="storage-fsize">340 KB</span>
                          </div>
                          <CheckCircle size={10} className="storage-check" />
                      </div>
                      <div className="storage-file-row storage-uploading-row">
                          <div className="storage-file-type vid">VID</div>
                          <div className="storage-file-info">
                              <span className="storage-fname">demo_clip.mp4</span>
                              <span className="storage-upload-status">
                                  <span className="storage-uploading-text">Uploading…</span>
                                  <span className="storage-done-text">Done • 12 MB</span>
                              </span>
                          </div>
                          <div className="storage-upload-ring">
                              <svg viewBox="0 0 20 20" width="14" height="14">
                                  <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                                  <circle cx="10" cy="10" r="8" fill="none" stroke="#00f5d4" strokeWidth="2"
                                      strokeDasharray="50.26" strokeDashoffset="50.26" strokeLinecap="round"
                                      className="storage-ring-progress" />
                              </svg>
                          </div>
                      </div>
                  </div>
                  <div className="storage-bar-track">
                      <div className="storage-bar-fill"></div>
                  </div>
              </div>
          </div>
      )
  },
  {
      id: 'mail',
      title: 'Transactional Mailer',
      badge: 'COMMUNICATION',
      desc: 'Pre-wired email dispatchers for user verification, password recovery, and system notifications. Customize layouts using pre-made email templates.',
      icon: Mail,
      color: '#00e676',
      visual: (
          <div className="mini-visual mail-visual">
              <div className="mini-mail-envelope">
                  <div className="mail-header">
                      <Mail size={12} className="mail-badge-icon" />
                      <span>verify@urbackend.com</span>
                  </div>
                  <div className="mail-content">
                      <div className="mail-title">Welcome! Please verify email</div>
                      <div className="mail-bar-btn">Verify Account</div>
                  </div>
                  <div className="mail-status-bar">
                      <span className="mail-status-sending">● Sending...</span>
                      <span className="mail-status-sent">✔ Sent successfully</span>
                  </div>
              </div>
          </div>
      )
  },
  {
      id: 'security',
      title: 'Row-Level Security',
      badge: 'SECURITY',
      desc: 'Fine-grained read/write security configurations. Restrict access directly inside public-api based on document ownership and user authentication tokens.',
      icon: Lock,
      color: '#a855f7',
      visual: (
          <div className="mini-visual security-visual">
              <div className="policy-badge">RLS ENFORCED</div>
              <div className="policy-editor">
                  <div className="policy-line"><span className="policy-keyword">policy</span> "owner-write-only"</div>
                  <div className="policy-line indent"><span className="policy-action">allow</span> write: <span className="policy-keyword">if</span> owner == auth.id</div>
                  <div className="policy-line indent"><span className="policy-action">allow</span> read: <span className="policy-keyword">if</span> public</div>
              </div>
          </div>
      )
  },
  {
      id: 'realtime',
      title: 'Realtime Broadcast',
      badge: 'REALTIME',
      desc: 'Listen to database mutations instantly or broadcast custom events across clients using low-latency WebSocket connections.',
      icon: Activity,
      color: '#FF5F56',
      visual: (
          <div className="mini-visual realtime-visual">
              <div className="mini-realtime-stage">
                  <div className="realtime-node node-a">
                      <Smartphone size={12} />
                      <span>Client A</span>
                  </div>
                  <div className="realtime-pipe">
                      <div className="realtime-pulse"></div>
                  </div>
                  <div className="realtime-node node-b">
                      <Smartphone size={12} />
                      <span>Client B</span>
                  </div>
                  <div className="realtime-status-badge">CONNECTED</div>
              </div>
          </div>
      )
  }
];
