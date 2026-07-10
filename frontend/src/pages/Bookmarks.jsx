import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = () => {
    fetch('http://localhost:8000/api/bookmarks', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      // The API returns a list of bookmark objects {id, user_id, document_id, created_at, document: {...}}
      setBookmarks(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const removeBookmark = async (docId) => {
    try {
      await fetch(`http://localhost:8000/api/bookmarks/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      fetchBookmarks();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading your saved documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Your Bookmarks</h1>
        <p className="text-slate-400 text-lg">Documents you've saved for quick access later.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl mt-8">
          <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No bookmarks yet</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8">
            You haven't saved any documents. Browse the library and click the bookmark icon to save documents here.
          </p>
          <Link to="/library" className="px-6 py-3 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-medium transition-colors inline-block">
            Explore Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bm, i) => {
            const doc = bm.document || {}; // Fallback in case document is not joined
            return (
              <motion.div 
                key={bm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-400 rounded-md text-xs font-medium uppercase tracking-wider">
                    {doc.file_type || 'DOC'}
                  </span>
                  <button onClick={() => removeBookmark(doc.id || bm.document_id)} className="p-2 text-brand-400 hover:text-brand-300 hover:bg-white/10 rounded-lg transition-colors" title="Remove Bookmark">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
                  <Link to={`/document/${doc.id || bm.document_id}`}>
                    {doc.title || "Unknown Document"}
                  </Link>
                </h3>
                
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                  {doc.description || "No description available."}
                </p>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs text-slate-500">
                    Saved {new Date(bm.created_at).toLocaleDateString()}
                  </span>
                  <Link to={`/document/${doc.id || bm.document_id}`} className="text-sm text-white font-medium hover:text-brand-400 transition-colors">
                    View &rarr;
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
