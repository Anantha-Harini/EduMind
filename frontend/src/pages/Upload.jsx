import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myDocs, setMyDocs] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const fetchData = async () => {
    try {
      const [catsRes, docsRes] = await Promise.all([
        fetch('http://localhost:8000/api/categories/', { headers: { 'Authorization': `Bearer ${user.token}` } }),
        fetch('http://localhost:8000/api/documents/', { headers: { 'Authorization': `Bearer ${user.token}` } })
      ]);
      if (catsRes.ok) setCategories(await catsRes.json());
      if (docsRes.ok) {
        const docs = await docsRes.json();
        // Since we don't have a GET /me docs endpoint, filter by user id if available.
        // If not, we just show all docs (for MVP testing purposes)
        setMyDocs(docs); 
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.token]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a file to upload.");
    
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (categoryId) formData.append('category_id', categoryId);
    if (tags) formData.append('tags', tags);

    try {
      const res = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Upload failed");
      }
      
      // Navigate to role-appropriate dashboard
      const role = (user.role || '').toLowerCase();
      if (role === 'admin') navigate('/admin');
      else if (role === 'student') navigate('/student');
      else navigate('/faculty');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Upload Resource</h1>
        <p className="text-slate-400 text-lg">Add new knowledge to the portal for students.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Document Title *</label>
            <input 
              type="text" required
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="e.g. Intro to Advanced Data Structures"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 h-24"
              placeholder="Brief overview of the document..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category <span className="text-slate-500">(auto-detected if empty)</span></label>
              <select 
                value={categoryId} onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none"
              >
                <option value="">AI Auto-Detect</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <input 
                type="text" value={tags} onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="cs, data-structures, arrays (comma separated)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">File * (PDF, DOCX, PPTX, TXT)</label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 rounded-xl bg-slate-900/30 ${dragActive ? 'border-brand-500' : 'border-white/10'} border-dashed hover:bg-slate-900/50 transition-colors`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              aria-label="File upload drop zone"
            >
              <div className="space-y-1 text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-slate-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-400 hover:text-red-600"
                      aria-label="Remove selected file"
                    >✕</button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-slate-400 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-brand-400 hover:text-brand-300 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files[0])} accept=".pdf,.docx,.pptx,.txt" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                  </>
                )}
                <p className="text-xs text-slate-500">
                  {file ? file.name : "Up to 10MB"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {file && (
              <button 
                type="button"
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Saving...
                  </>
                ) : 'Save Document'}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-panel p-8 rounded-3xl mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Manage Uploads</h2>
        <div className="space-y-4">
          {myDocs.map(doc => (
            <div key={doc.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold">{doc.title}</h3>
                <p className="text-slate-400 text-sm">Status: <span className="uppercase">{doc.status}</span></p>
              </div>
              <button onClick={() => handleDelete(doc.id)} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
