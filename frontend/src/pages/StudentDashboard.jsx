import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_quizzes: 0,
    average_score: 0,
    docs_viewed: 0
  });
  const [announcements, setAnnouncements] = useState([]);
  const [history, setHistory] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);

  useEffect(() => {
    if (!user || !user.token) return;
    
    fetch('http://localhost:8000/api/analytics/student/me', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(err => console.error(err));

    fetch('http://localhost:8000/api/announcements', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      if (Array.isArray(data)) setAnnouncements(data);
    })
    .catch(err => console.error(err));

    fetch('http://localhost:8000/api/analytics/student/history', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      if (Array.isArray(data)) setHistory(data.reverse()); // Reverse for chronological chart
    })
    .catch(err => console.error(err));
    
    fetch('http://localhost:8000/api/analytics/student/weak-topics', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      if (Array.isArray(data)) setWeakTopics(data);
    })
    .catch(err => console.error(err));
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Welcome back, <span className="text-gradient">{user.fullName || user.email?.split('@')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 text-lg">Your personalized AI learning journey awaits.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-b-4 border-brand-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-brand-500/20 text-brand-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300">Docs Viewed</h3>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{stats.docs_viewed}</p>
        </div>
        
        <div className="glass-card p-6 border-b-4 border-blue-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300">Quizzes Taken</h3>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{stats.total_quizzes}</p>
        </div>

        <div className="glass-card p-6 border-b-4 border-emerald-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300">Average Score</h3>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{stats.average_score}%</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-xl font-bold text-white mb-4">Quiz Progress</h3>
          <div className="flex-1 w-full h-full">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="document_title" stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val) => val.length > 10 ? val.substring(0, 10)+'...' : val} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    formatter={(value, name, props) => [`${Math.round((value / Math.max(props.payload.total_questions, 1)) * 100)}%`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Take some quizzes to see your progress!
              </div>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-xl font-bold text-white mb-4">Areas to Improve</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {weakTopics.length > 0 ? (
              weakTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <span className="font-semibold text-slate-200">{topic.topic}</span>
                  </div>
                  <span className="text-red-400 font-bold">{topic.score}% avg</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-emerald-400 font-medium">
                You're doing great! No weak topics detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Content */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recommended for you</h2>
          <Link to="/library" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">View Library &rarr;</Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-6">Recent Announcements</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
              {announcements.length === 0 ? (
                <p className="text-slate-400 text-center mt-10">No new announcements.</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                    <h4 className="font-bold text-brand-300 mb-1">{ann.title}</h4>
                    <p className="text-sm text-slate-300">{ann.content}</p>
                    <p className="text-xs text-slate-500 mt-3">{new Date(ann.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Recent Quizzes</h3>
              <div className="space-y-4 mt-6">
                {history.length === 0 ? (
                  <p className="text-slate-400 text-sm">No quizzes taken yet.</p>
                ) : history.map((quiz) => {
                  const percentage = Math.round((quiz.score / Math.max(quiz.total_questions, 1)) * 100);
                  const isHigh = percentage >= 80;
                  return (
                  <div key={quiz.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isHigh ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-500/10 text-brand-400'}`}>
                        Q
                      </div>
                      <div>
                        <p className="font-semibold text-white truncate max-w-[200px]">{quiz.document_title}</p>
                        <p className="text-sm text-slate-400">{new Date(quiz.completed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${isHigh ? 'text-emerald-400' : 'text-brand-400'}`}>{percentage}%</span>
                      <p className="text-xs text-slate-500">{quiz.score}/{quiz.total_questions}</p>
                    </div>
                  </div>
                )})}
              </div>
            </div>
            <button onClick={() => navigate('/history')} className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
