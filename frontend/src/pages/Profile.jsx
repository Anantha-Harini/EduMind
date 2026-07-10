import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', department: '', bio: '' });

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:8000/api/profile', { headers: { 'Authorization': `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(d => { setProfile(d); setFormData({ full_name: d.full_name || '', department: d.department || '', bio: d.bio || '' }); });

    fetch('http://localhost:8000/api/bookmarks', { headers: { 'Authorization': `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(setBookmarks);
  }, [user]);

  const saveProfile = async () => {
    await fetch('http://localhost:8000/api/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setProfile({...profile, ...formData});
    setEditMode(false);
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-4xl font-bold text-white">Your Profile</h1>
      
      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Personal Information</h2>
          <button onClick={() => editMode ? saveProfile() : setEditMode(true)} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-white font-medium">
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {editMode ? (
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name</label>
              <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Bio</label>
              <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white h-24" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p><span className="text-slate-400 w-32 inline-block">Email:</span> <span className="text-white font-medium">{profile.email}</span></p>
            <p><span className="text-slate-400 w-32 inline-block">Role:</span> <span className="text-white font-medium uppercase">{profile.role}</span></p>
            <p><span className="text-slate-400 w-32 inline-block">Name:</span> <span className="text-white font-medium">{profile.full_name || 'Not set'}</span></p>
            <p><span className="text-slate-400 w-32 inline-block">Department:</span> <span className="text-white font-medium">{profile.department || 'Not set'}</span></p>
            <p><span className="text-slate-400 w-32 inline-block">Bio:</span> <span className="text-white font-medium">{profile.bio || 'Not set'}</span></p>
          </div>
        )}
      </div>

      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Saved Bookmarks</h2>
        {bookmarks.length === 0 ? (
          <p className="text-slate-400">You haven't bookmarked any documents yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map(bm => (
              <div key={bm.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex justify-between items-center">
                <span className="text-white font-medium">Document ID: {bm.document_id}</span>
                <button className="text-red-400 text-sm hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
