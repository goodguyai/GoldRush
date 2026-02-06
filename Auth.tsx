
import React, { useState } from 'react';
import { signIn, signUp } from './databaseService';
import { OlympicRings, ArrowRight, BookOpen } from './Icons';
import HowItWorks from './HowItWorks';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = "Authentication failed.";
      
      const errorCode = err.code;
      const errorMessage = err.message || "";

      if (errorCode === "auth/invalid-email" || errorMessage.includes("auth/invalid-email")) {
        msg = "Invalid email address.";
      } else if (
        errorCode === "auth/user-not-found" || 
        errorCode === "auth/wrong-password" || 
        errorCode === "auth/invalid-credential" ||
        errorCode === "auth/invalid-login-credentials" || // New Firebase error code
        errorMessage.includes("auth/user-not-found") || 
        errorMessage.includes("auth/wrong-password") || 
        errorMessage.includes("auth/invalid-credential") ||
        errorMessage.includes("auth/invalid-login-credentials")
      ) {
        msg = "Invalid email or password.";
      } else if (errorCode === "auth/email-already-in-use" || errorMessage.includes("auth/email-already-in-use")) {
        msg = "Email already in use.";
      } else if (errorCode === "auth/weak-password" || errorMessage.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      } else if (errorCode === "auth/too-many-requests" || errorMessage.includes("auth/too-many-requests")) {
        msg = "Too many attempts. Please try again later.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden">
      
      <div className="max-w-md mx-auto w-full relative z-10 animate-fade-in pb-10">
        
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-8 md:p-10 relative border border-white/60">
          
          {/* Logo */}
          <div className="w-24 h-24 bg-white rounded-[24px] mx-auto flex items-center justify-center shadow-lg mb-6 text-electric-600 border border-gray-100">
            <OlympicRings size={56} className="opacity-90" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Gold Hunt '26</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.25em] mt-2">OLYMPICS FANTASY SPORTS</p>
          </div>

          {/* Fixed Toggle */}
          <div className="bg-gray-100 rounded-full p-1.5 flex mb-8 shadow-inner">
            <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                isLogin 
                    ? 'bg-white text-gray-900 shadow-md transform scale-[1.02]' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
            >
                Login
            </button>
            <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                !isLogin 
                    ? 'bg-white text-gray-900 shadow-md transform scale-[1.02]' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
            >
                Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 shadow-inner focus:border-electric-600 focus:ring-2 focus:ring-electric-200 transition-all font-medium outline-none"
                placeholder="agent@goldhunt.app"
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 shadow-inner focus:border-electric-600 focus:ring-2 focus:ring-electric-200 transition-all font-medium outline-none"
                placeholder="••••••••"
                required 
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                 <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                 <p className="text-red-600 text-xs font-bold leading-none pt-0.5">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-electric-600 hover:bg-electric-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 uppercase text-xs tracking-widest"
            >
              {loading ? 'Authenticating...' : (isLogin ? 'ENTER THE HUNT' : 'Create Identity')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center flex justify-center">
            <button 
                onClick={() => setShowHowItWorks(true)}
                className="bg-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 font-semibold text-gray-900 text-sm"
            >
                <BookOpen size={20} className="text-electric-600" />
                Mission Briefing
            </button>
        </div>
      </div>

      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}
    </div>
  );
};

export default Auth;
