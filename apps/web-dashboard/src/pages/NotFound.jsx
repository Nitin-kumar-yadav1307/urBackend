import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Terminal } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();
    const [terminalText, setTerminalText] = useState(['> Initializing search sequence...', '> Accessing /var/log/routes...', '> Error: Path not found in routing table.', '> Status: 404 Not Found', '> Location: The Void']);
    const [inputValue, setInputValue] = useState('');
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const terminalRef = useRef(null);

    // Auto-scroll terminal to bottom
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalText]);

    // Typewriter effect simulation (adds lines one by one initially)
    useEffect(() => {
        const initialLogs = ['> Initializing search sequence...', '> Analyzing request headers...', '> Checking neural pathways...', '> Searching /dev/null...', '> Error: 404 - Page Data Corrupted.', '> System halted.'];

        setTerminalText([]); // Start empty

        let i = 0;
        const interval = setInterval(() => {
            if (i < initialLogs.length) {
                setTerminalText(prev => [...prev, initialLogs[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 600);

        return () => clearInterval(interval);
    }, []);


    // Track mouse movement for background effect
    const handleMouseMove = (e) => {
        // Calculate percentage position
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        setMousePos({ x, y });
    };

    // Handle fake console input
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cmd = inputValue.trim().toLowerCase();
            setTerminalText(prev => [...prev, `> user@urBackend:~$ ${inputValue}`]);
            setInputValue('');

            if (cmd === 'help' || cmd === 'ls' || cmd === 'cd') {
                setTimeout(() => {
                    setTerminalText(prev => [...prev, `> Nice try, but this terminal is dead. Redirecting to safety...`]);
                    setTimeout(() => navigate('/'), 2000);
                }, 500);
            } else if (cmd !== '') {
                setTimeout(() => {
                    setTerminalText(prev => [...prev, `> Command not found: ${cmd}. Try clicking a button instead.`]);
                }, 500);
            }
        }
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a', // Slightly darker than main theme for contrast
                color: 'var(--color-text-main)',
                overflow: 'hidden',
                position: 'relative',
                background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(62, 207, 142, 0.15) 0%, transparent 50%), #0a0a0a`
            }}>

            {/* --- Glitchy 404 Title --- */}
            <div className="glitch-container">
                <h1 className="glitch" data-text="404">404</h1>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', color: '#fff', fontFamily: 'monospace' }}>
                <span style={{ color: 'var(--color-primary)' }}>{'<'}</span> Path_Not_Found <span style={{ color: 'var(--color-primary)' }}>{'/>'}</span>
            </h2>

            {/* --- Fake Terminal Window --- */}
            <div className="terminal-window" style={{
                width: '90%',
                maxWidth: '600px',
                backgroundColor: '#000',
                border: '1px solid #333',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                marginBottom: '2rem',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Terminal Header */}
                <div style={{ background: '#1a1a1a', padding: '8px 12px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
                    <Terminal size={14} />
                    <span>urBackend Console -- Crash Log</span>
                </div>

                {/* Terminal Output Area */}
                <div ref={terminalRef} style={{ padding: '16px', height: '200px', overflowY: 'auto', color: '#4ade80', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    {terminalText.map((line, index) => (
                        <div key={index} style={{ marginBottom: '4px', opacity: 0.9 }}>{line}</div>
                    ))}
                    {/* Interactive Input Line */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #222', paddingTop: '8px' }}>
                        <span style={{ color: 'var(--color-primary)', marginRight: '8px' }}>user@urBackend:~$</span>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontFamily: 'monospace', outline: 'none', flex: 1 }}
                        />
                        <span className="blinking-cursor">_</span>
                    </div>
                </div>
            </div>


            {/* --- Action Buttons --- */}
            <div style={{ display: 'flex', gap: '1rem', zIndex: 10 }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Home size={18} /> Return to Dashboard
                </button>
            </div>

            {/* --- CSS Animations --- */}
            <style>{`
                /* Glitch Effect for 404 */
                .glitch-container { position: relative; margin-bottom: 0.5rem; }
                .glitch {
                    font-size: 6rem;
                    fontWeight: 800;
                    lineHeight: 1;
                    position: relative;
                    color: #fff;
                    letter-spacing: 4px;
                }
                .glitch::before, .glitch::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                }
                .glitch::before {
                    left: 2px;
                    text-shadow: -2px 0 #ff00c1;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim 5s infinite linear alternate-reverse;
                }
                .glitch::after {
                    left: -2px;
                    text-shadow: -2px 0 #00fff9;
                    clip: rect(44px, 450px, 56px, 0);
                    animation: glitch-anim2 5s infinite linear alternate-reverse;
                }

                @keyframes glitch-anim {
                    0% { clip: rect(31px, 9999px, 94px, 0); transform: skew(0.85deg); }
                    5% { clip: rect(70px, 9999px, 18px, 0); transform: skew(0.07deg); }
                    10% { clip: rect(27px, 9999px, 10px, 0); transform: skew(0.28deg); }
                    15% { clip: rect(3px, 9999px, 99px, 0); transform: skew(0.43deg); }
                    20% { clip: rect(35px, 9999px, 53px, 0); transform: skew(0.69deg); }
                    25% { clip: rect(97px, 9999px, 36px, 0); transform: skew(0.74deg); }
                    30% { clip: rect(70px, 9999px, 100px, 0); transform: skew(0.9deg); }
                    35% { clip: rect(73px, 9999px, 93px, 0); transform: skew(0.18deg); }
                    40% { clip: rect(57px, 9999px, 88px, 0); transform: skew(0.53deg); }
                    45% { clip: rect(26px, 9999px, 61px, 0); transform: skew(0.05deg); }
                    50% { clip: rect(66px, 9999px, 35px, 0); transform: skew(0.48deg); }
                    55% { clip: rect(11px, 9999px, 48px, 0); transform: skew(0.75deg); }
                    60% { clip: rect(23px, 9999px, 56px, 0); transform: skew(0.23deg); }
                    65% { clip: rect(74px, 9999px, 21px, 0); transform: skew(0.16deg); }
                    70% { clip: rect(70px, 9999px, 57px, 0); transform: skew(0.32deg); }
                    75% { clip: rect(23px, 9999px, 21px, 0); transform: skew(0.68deg); }
                    80% { clip: rect(86px, 9999px, 83px, 0); transform: skew(0.23deg); }
                    85% { clip: rect(66px, 9999px, 66px, 0); transform: skew(0.1deg); }
                    90% { clip: rect(100px, 9999px, 16px, 0); transform: skew(0.6deg); }
                    95% { clip: rect(16px, 9999px, 93px, 0); transform: skew(0.06deg); }
                    100% { clip: rect(91px, 9999px, 29px, 0); transform: skew(0.72deg); }
                }
                @keyframes glitch-anim2 {
                    0% { clip: rect(65px, 9999px, 100px, 0); transform: skew(0.53deg); }
                    5% { clip: rect(52px, 9999px, 74px, 0); transform: skew(0.58deg); }
                    10% { clip: rect(79px, 9999px, 85px, 0); transform: skew(0.27deg); }
                    15% { clip: rect(75px, 9999px, 5px, 0); transform: skew(0.34deg); }
                    20% { clip: rect(67px, 9999px, 61px, 0); transform: skew(0.22deg); }
                    25% { clip: rect(10px, 9999px, 85px, 0); transform: skew(0.29deg); }
                    30% { clip: rect(23px, 9999px, 65px, 0); transform: skew(0.15deg); }
                    35% { clip: rect(84px, 9999px, 75px, 0); transform: skew(0.42deg); }
                    40% { clip: rect(46px, 9999px, 13px, 0); transform: skew(0.18deg); }
                    45% { clip: rect(3px, 9999px, 59px, 0); transform: skew(0.65deg); }
                    50% { clip: rect(75px, 9999px, 72px, 0); transform: skew(0.48deg); }
                    55% { clip: rect(39px, 9999px, 50px, 0); transform: skew(0.79deg); }
                    60% { clip: rect(84px, 9999px, 77px, 0); transform: skew(0.02deg); }
                    65% { clip: rect(90px, 9999px, 55px, 0); transform: skew(0.55deg); }
                    70% { clip: rect(12px, 9999px, 25px, 0); transform: skew(0.72deg); }
                    75% { clip: rect(6px, 9999px, 22px, 0); transform: skew(0.91deg); }
                    80% { clip: rect(97px, 9999px, 91px, 0); transform: skew(0.34deg); }
                    85% { clip: rect(34px, 9999px, 53px, 0); transform: skew(0.67deg); }
                    90% { clip: rect(55px, 9999px, 24px, 0); transform: skew(0.33deg); }
                    95% { clip: rect(62px, 9999px, 97px, 0); transform: skew(0.53deg); }
                    100% { clip: rect(15px, 9999px, 31px, 0); transform: skew(0.66deg); }
                }

                /* Blinking Cursor */
                .blinking-cursor {
                    animation: blink 1s step-end infinite;
                    color: var(--color-primary);
                }
                @keyframes blink { 50% { opacity: 0; } }

                /* Custom Scrollbar for Terminal */
                .terminal-window ::-webkit-scrollbar { width: 6px; }
                .terminal-window ::-webkit-scrollbar-track { background: #000; }
                .terminal-window ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
            `}</style>
        </div>
    );
}