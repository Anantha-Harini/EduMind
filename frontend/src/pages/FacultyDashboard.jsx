import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    total_documents: 0,
    total_views: 0,
    total_upvotes: 0,
    quiz_attempts_on_materials: 0,
    average_quiz_score_on_materials: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const resDocs = await fetch('http://localhost:8000/api/documents/', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (resDocs.ok) {
          const data = await resDocs.json();
          setDocuments(data.filter(d => d.owner_id === user.id)); 
        }

        const resStats = await fetch('http://localhost:8000/api/analytics/faculty/stats', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (resStats.ok) {
          const data = await resStats.json();
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Faculty Portal</h1>
          <p className="text-slate-400 text-lg">Manage your uploaded resources and view analytics.</p>
        </div>
        <Link to="/upload" className="px-6 py-3 rounded-xl shadow-lg shadow-brand-500/25 text-white bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 font-medium transition-all">
          + Upload Resource
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm text-slate-400 font-medium mb-1">Total Uploads</h3>
          <p className="text-4xl font-bold text-white">{stats.total_documents}</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm text-slate-400 font-medium mb-1">Total Views</h3>
          <p className="text-4xl font-bold text-white">{stats.total_views}</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm text-slate-400 font-medium mb-1">Total Upvotes</h3>
          <p className="text-4xl font-bold text-brand-400">{stats.total_upvotes}</p>
        </div>
        <div className="glass-card p-6 border border-emerald-500/30 bg-emerald-500/5">
          <h3 className="text-sm text-emerald-300 font-medium mb-1">Avg Quiz Score</h3>
          <p className="text-4xl font-bold text-emerald-400">{stats.average_quiz_score_on_materials}%</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-xl font-bold text-white mb-4">Most Viewed Documents</h3>
          <div className="flex-1 w-full h-full">
            {documents.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={documents.sort((a,b) => b.view_count - a.view_count).slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="title" type="category" stroke="#94a3b8" width={100} tick={{fontSize: 12}} tickFormatter={(val) => val.length > 10 ? val.substring(0, 10)+'...' : val} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="view_count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Views" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No data available</div>
            )}
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-xl font-bold text-white mb-4">Document Upvotes</h3>
          <div className="flex-1 w-full h-full">
            {documents.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={documents.sort((a,b) => (b.upvote_count||0) - (a.upvote_count||0)).slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="title" stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val) => val.length > 10 ? val.substring(0, 10)+'...' : val} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="upvote_count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} name="Upvotes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Your Resources</h2>
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-12 h-12 mx-auto text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
            <p>You haven't uploaded any documents yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">{doc.title}</h3>
                  <div className="flex gap-3 text-sm text-slate-400 mt-1">
                    <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{doc.view_count} views</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    doc.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {doc.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
