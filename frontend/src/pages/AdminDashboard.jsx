import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingDocs, setPendingDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, statsRes, usersRes, annRes] = await Promise.all([
        fetch('http://localhost:8000/api/documents/?status=pending', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('http://localhost:8000/api/analytics/overview', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('http://localhost:8000/api/users', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('http://localhost:8000/api/announcements', { headers: { 'Authorization': `Bearer ${user.token}` } })
      ]);
      
      if (docsRes.ok) setPendingDocs((await docsRes.json()).filter(d => d.status === 'pending'));
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (annRes.ok) setAnnouncements(await annRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, role) => {
    await fetch(`http://localhost:8000/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    fetchData();
  };

  const postAnnouncement = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/api/announcements', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnnouncement)
    });
    setNewAnnouncement({ title: '', content: '' });
    fetchData();
  };

  const deleteAnnouncement = async (annId) => {
    if (!confirm('Delete this announcement?')) return;
    await fetch(`http://localhost:8000/api/announcements/${annId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    fetchData();
  };

  const handleModeration = async (docId, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${docId}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }) // 'approved' or 'rejected'
      });
      if (res.ok) {
        fetchData(); // refresh list
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Admin Console</h1>
        <p className="text-slate-400 text-lg">System analytics and content moderation.</p>
      </div>
      
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.total_users || usersList.length}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400 font-medium">Total Documents</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.total_docs || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400 font-medium">Total Searches</p>
          <p className="text-3xl font-bold text-white mt-1">{stats?.total_searches || 0}</p>
        </div>
        <div className="glass-card p-6 border border-brand-500/30 bg-brand-500/5">
          <p className="text-sm text-brand-300 font-medium">Pending Approvals</p>
          <p className="text-3xl font-bold text-brand-400 mt-1">{pendingDocs.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/upload" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
            <div className="p-3 bg-brand-500/20 text-brand-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div>
              <h4 className="font-bold text-white">Upload System Resource</h4>
              <p className="text-sm text-slate-400">Directly add an approved document to the library</p>
            </div>
          </Link>
          <Link to="/library" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h4 className="font-bold text-white">Browse Library</h4>
              <p className="text-sm text-slate-400">View all approved documents in the knowledge base</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="glass-panel p-6 rounded-3xl mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Moderation Queue</h2>
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : pendingDocs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-12 h-12 mx-auto text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
            <p>No documents pending approval. Excellent!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="pb-3 px-4 font-medium">Document Title</th>
                  <th className="pb-3 px-4 font-medium">Uploader</th>
                  <th className="pb-3 px-4 font-medium">Type</th>
                  <th className="pb-3 px-4 font-medium">Date</th>
                  <th className="pb-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDocs.map(doc => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <Link to={`/document/${doc.id}`} className="text-white font-medium hover:text-brand-400 transition-colors">
                        {doc.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-300">ID: {doc.owner_id}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-slate-300">{doc.file_type || 'Unknown'}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm">{new Date(doc.upload_date).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button onClick={() => handleModeration(doc.id, 'approved')} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md text-sm font-medium transition-colors">
                        Approve
                      </button>
                      <button onClick={() => handleModeration(doc.id, 'rejected')} className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-md text-sm font-medium transition-colors">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Announcements Manager */}
      <div className="glass-panel p-6 rounded-3xl mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Manage Announcements</h2>
        <form onSubmit={postAnnouncement} className="mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input type="text" required value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
          </div>
          <div className="flex-[2]">
            <label className="block text-sm text-slate-400 mb-1">Content</label>
            <input type="text" required value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
          </div>
          <button type="submit" className="px-6 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-medium">Post</button>
        </form>
        <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white mb-1">{ann.title}</h4>
                    <p className="text-sm text-slate-300">{ann.content}</p>
                    <p className="text-xs text-slate-500 mt-2">{new Date(ann.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteAnnouncement(ann.id)} className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors" title="Delete Announcement">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
        </div>
      </div>

      {/* User Management */}
      <div className="glass-panel p-6 rounded-3xl mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Manage Users</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-sm">
              <th className="pb-3 px-4 font-medium">Email</th>
              <th className="pb-3 px-4 font-medium">Role</th>
              <th className="pb-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map(u => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="py-4 px-4 text-white">{u.email}</td>
                <td className="py-4 px-4 text-slate-300 uppercase">{u.role}</td>
                <td className="py-4 px-4 text-right space-x-2">
                  <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1">
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
