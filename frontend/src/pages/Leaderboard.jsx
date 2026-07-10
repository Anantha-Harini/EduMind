import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/analytics/leaderboard', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      setLeaders(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading top students...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-yellow-500 to-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Global Leaderboard</h1>
        <p className="text-slate-400 text-lg mt-2">Top students by quiz performance and engagement.</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden mt-8">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-sm font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">Student</div>
          <div className="col-span-2 text-center">Quizzes</div>
          <div className="col-span-2 text-right pr-4">Score</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {leaders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No data available yet. Be the first to take a quiz!</div>
          ) : leaders.map((student, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-white/5 ${idx < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''}`}
            >
              <div className="col-span-2 flex justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-yellow-500 text-yellow-900' :
                  idx === 1 ? 'bg-slate-300 text-slate-800' :
                  idx === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-white/10 text-slate-300'
                }`}>
                  {student.rank}
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-brand-300 font-bold uppercase">
                  {student.name[0]}
                </div>
                <span className={`font-semibold ${idx < 3 ? 'text-white' : 'text-slate-300'}`}>
                  {student.name}
                </span>
              </div>
              <div className="col-span-2 text-center text-slate-400 font-medium">
                {student.quizzes_taken}
              </div>
              <div className="col-span-2 text-right pr-4">
                <span className={`font-bold text-lg ${idx < 3 ? 'text-yellow-400' : 'text-brand-400'}`}>
                  {student.total_score}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
