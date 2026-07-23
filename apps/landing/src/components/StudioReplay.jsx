import React, { useState, useEffect } from 'react';
import { Database, Terminal, Code, Plus, Check, Cpu } from 'lucide-react';

export default function StudioReplay() {
  const [studioStep, setStudioStep] = useState(6);
  const [replayKey, setReplayKey] = useState(1); // Start animating on mount

  useEffect(() => {
    let active = true;
    const runAnimation = async () => {
      setStudioStep(0);
      const delays = [600, 600, 600, 700, 900, 800];
      for (let i = 0; i < delays.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, delays[i]));
        if (!active) return;
        setStudioStep(i + 1);
      }
    };
    runAnimation();
    return () => {
      active = false;
    };
  }, [replayKey]);

  const triggerStudioReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div className="hero-interactive-window">
      <div className="lh-header">
        <div className="lh-dots">
          <span className="lh-dot lh-dot-red"></span>
          <span className="lh-dot lh-dot-yellow"></span>
          <span className="lh-dot lh-dot-green"></span>
        </div>
        <div className="lh-title">
          <Terminal size={14} />
          <span>urBackend Studio</span>
        </div>
        <button className="lh-replay" type="button" onClick={triggerStudioReplay}>↻ Replay</button>
      </div>
      <div className="lh-content">
        <div className="lh-pane">
          <div className="lh-pane-header">
            <Database size={14} />
            <span>Collection Builder</span>
            <span className="lh-pane-label">UI Mode</span>
          </div>
          <div className="lh-builder">
            <div className="lh-group">
              <label>Name</label>
              <div className="lh-input">users</div>
            </div>
            <div className="lh-head-row">
              <span>NAME</span>
              <span>TYPE</span>
              <span>REQ</span>
            </div>
            <div className="lh-table">
              <div className={`lh-row ${studioStep >= 1 ? 'visible' : ''}`}>
                <span className="lh-name">name</span>
                <span className="lh-type">String</span>
                <span className="lh-req on"><Check size={12} /></span>
              </div>
              <div className={`lh-row ${studioStep >= 2 ? 'visible' : ''}`}>
                <span className="lh-name">email</span>
                <span className="lh-type">String</span>
                <span className="lh-req on"><Check size={12} /></span>
              </div>
              <div className={`lh-row ${studioStep >= 3 ? 'visible' : ''}`}>
                <span className="lh-name">role</span>
                <span className="lh-type">String</span>
                <span className="lh-req off">—</span>
              </div>
            </div>
            <div className="lh-actions">
              <button type="button" className="lh-add-btn"><Plus size={12} />Add Column</button>
            </div>
          </div>
        </div>
        <div className="lh-middle">
          <div className="lh-line">
            <div className={`lh-pulse ${studioStep === 4 ? 'active' : ''}`}></div>
          </div>
          <div className={`lh-engine ${studioStep === 4 ? 'pulsing' : ''}`}>
            <Cpu size={20} />
          </div>
        </div>
        <div className="lh-pane lh-pane-right">
          <div className="lh-pane-header">
            <Code size={14} />
            <span>Generated APIs</span>
            <span className="lh-pane-label">endpoints</span>
          </div>
          <div className={`lh-endpoints ${studioStep >= 5 ? 'visible' : ''}`}>
            <div className="lh-endpoint active" style={{ transitionDelay: '0.0s' }}>
              <span className="lh-method get">GET</span>
              <code>/api/users</code>
              <span className="lh-status"><Check size={12} />200 OK</span>
            </div>
            <div className="lh-endpoint active" style={{ transitionDelay: '0.15s' }}>
              <span className="lh-method post">POST</span>
              <code>/api/users</code>
              <span className="lh-status"><Check size={12} />201 Created</span>
            </div>
            <div className="lh-endpoint active" style={{ transitionDelay: '0.3s' }}>
              <span className="lh-method get">GET</span>
              <code>/api/users/:id</code>
              <span className="lh-status"><Check size={12} />200 OK</span>
            </div>
            <div className="lh-endpoint active" style={{ transitionDelay: '0.45s' }}>
              <span className="lh-method put">PUT</span>
              <code>/api/users/:id</code>
              <span className="lh-status"><Check size={12} />200 OK</span>
            </div>
            <div className="lh-endpoint active" style={{ transitionDelay: '0.6s' }}>
              <span className="lh-method delete">DELETE</span>
              <code>/api/users/:id</code>
              <span className="lh-status"><Check size={12} />200 OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
