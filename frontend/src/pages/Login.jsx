import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-900">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-brand-600/30 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Left Content Area - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500 to-blue-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <span className="text-3xl font-bold text-gradient tracking-tight">EduMind</span>
        </div>
        
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
            The next evolution in <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400">
              knowledge management
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-lg">
            Empowered by AI to organize, summarize, and retrieve institutional knowledge faster than ever before.
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>© 2026 EduMind Platform</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Privacy</span>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span>Terms</span>
        </div>
      </div>

      {/* Right Content Area - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md glass-panel p-10 rounded-3xl"
        >
          <div className="text-center mb-10 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-blue-500 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">EduMind</h2>
            <p className="text-slate-400">Sign in to your account</p>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Please enter your details to sign in.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </div>
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@kmp.edu"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-sm text-brand-400 hover:text-brand-300 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white font-medium hover:from-brand-500 hover:to-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg shadow-brand-500/25 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-slate-400 text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { setEmail('admin@kmp.edu'); setPassword('admin123'); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-center text-slate-300 border border-white/5 transition-colors">Admin</button>
              <button onClick={() => { setEmail('faculty@kmp.edu'); setPassword('faculty123'); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-center text-slate-300 border border-white/5 transition-colors">Faculty</button>
              <button onClick={() => { setEmail('student@kmp.edu'); setPassword('student123'); }} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-center text-slate-300 border border-white/5 transition-colors">Student</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
