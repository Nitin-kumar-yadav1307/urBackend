import React, { useState } from 'react';
import { client, storeSession } from '../lib/ub';
import { Mail, Lock, User, ArrowRight, Loader2, Square } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '', username: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isLogin) {
        res = await client.auth.login({ email: form.email, password: form.password });
        storeSession(res.accessToken, res.refreshToken);
      } else {
        await client.auth.signUp({
          email: form.email,
          password: form.password,
          name: form.name,
          username: form.username || form.email.split('@')[0]
        });
        res = await client.auth.login({ email: form.email, password: form.password });
        storeSession(res.accessToken, res.refreshToken);
      }
      onLogin();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Decoration (Bold Vibrant Section) */}
      <div className="md:w-1/2 bg-[#db2777] border-b-[6px] md:border-b-0 md:border-r-[6px] border-black flex flex-col justify-between p-12 text-white overflow-hidden relative">
        <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
                <div className="bg-black w-14 h-14 flex items-center justify-center border-[3px] border-white">
                    <Square className="w-8 h-8 text-white fill-white" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">urKanban</h1>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
                FAST. <br/>
                BOLD. <br/>
                DIRECT.
            </h2>
            <p className="text-xl font-black uppercase tracking-[0.2em] opacity-80">The Minimalist SDK Showcase</p>
        </div>
        
        <div className="relative z-10 flex items-center gap-6 mt-12">
            <div className="bg-white text-black font-black py-2 px-4 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">v2.0.0</div>
            <div className="text-sm font-black uppercase tracking-widest border-b-[3px] border-white pb-1">Documentation</div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-black opacity-20 rotate-45 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white opacity-10 rounded-full pointer-events-none"></div>
      </div>

      {/* Right Auth Section (Monochrome) */}
      <div className="md:w-1/2 flex items-center justify-center p-12 relative overflow-hidden bg-white">
        <div className="max-w-md w-full relative z-10">
          <div className="mb-12">
            <h3 className="text-5xl font-black tracking-tighter uppercase mb-2">
                {isLogin ? 'Sign In' : 'Sign Up'}
            </h3>
            <p className="text-lg font-black tracking-widest uppercase opacity-40">
                {isLogin ? 'Access your workspace' : 'Join the mission'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1">Full Name</label>
                <input
                  type="text"
                  placeholder="ENTER NAME..."
                  required
                  className="w-full bg-white border-[3px] border-black p-4 focus:outline-none focus:bg-black focus:text-white font-black tracking-widest text-xs transition-all"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1">Email Address</label>
              <input
                type="email"
                placeholder="USER@DOMAIN..."
                required
                className="w-full bg-white border-[3px] border-black p-4 focus:outline-none focus:bg-black focus:text-white font-black tracking-widest text-xs transition-all"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1">Password</label>
              <input
                type="password"
                placeholder="********"
                required
                className="w-full bg-white border-[3px] border-black p-4 focus:outline-none focus:bg-black focus:text-white font-black tracking-widest text-xs transition-all"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-[#dc2626] text-white p-4 font-black text-xs uppercase tracking-widest border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Error: {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.4em] text-sm hover:bg-white hover:text-black border-[3px] border-black transition-all flex items-center justify-center gap-4 hover:shadow-[8px_8px_0px_0px_rgba(219,39,119,1)] active:translate-y-1 active:shadow-none"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'ENTER' : 'START'}</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 pt-12 border-t-[3px] border-black/5 flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">
              {isLogin ? "No account?" : "Already a member?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-8 py-3 border-[3px] border-black font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {isLogin ? 'Create Account' : 'Back to Login'}
            </button>
          </footer>
        </div>
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>
    </div>
  );
}
