import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/analytics/student/history', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      if (Array.isArray(data)) setHistory(data);
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
        <p className="text-slate-400">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Quiz History</h1>
        <p className="text-slate-400 text-lg mt-2">Review your past performance and track your learning progress over time.</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden mt-8">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-sm font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-6">Document</div>
          <div className="col-span-3 text-center">Date</div>
          <div className="col-span-3 text-right pr-4">Score</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No quizzes taken yet.</div>
          ) : history.map((quiz, idx) => {
            const percentage = Math.round((quiz.score / Math.max(quiz.total_questions, 1)) * 100);
            const isHigh = percentage >= 80;
            return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-white/5"
            >
              <div className="col-span-6 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isHigh ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'}`}>
                  Q
                </div>
                <span className="font-semibold text-white truncate pr-4">
                  {quiz.document_title}
                </span>
              </div>
              <div className="col-span-3 text-center text-slate-400 font-medium">
                {new Date(quiz.completed_at).toLocaleDateString()}
              </div>
              <div className="col-span-3 text-right pr-4 flex flex-col items-end">
                <span className={`font-bold text-lg ${isHigh ? 'text-emerald-400' : 'text-brand-400'}`}>
                  {percentage}%
                </span>
                <span className="text-xs text-slate-500">{quiz.score}/{quiz.total_questions} correct</span>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </div>
  );
}
