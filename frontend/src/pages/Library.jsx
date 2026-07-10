import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Library() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/documents/', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Assuming data is an array of documents
        setDocuments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(documents.map(d => d.category_name || 'Uncategorized').filter(Boolean))];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.tags && doc.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || (doc.category_name || 'Uncategorized') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Library</h1>
          <p className="text-slate-400 text-lg">Browse and search all available resources.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search documents, topics, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-brand-500 transition-all text-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.length > 0 ? filteredDocs.map((doc, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={doc.id}
            >
              <Link to={`/document/${doc.id}`} className="block h-full">
                <div className="glass-card p-6 h-full flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-slate-400 font-mono">
                      {doc.file_type ? doc.file_type.toUpperCase() : 'DOC'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-300 transition-colors">{doc.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                    {doc.description || "No description provided."}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                    {doc.tags ? doc.tags.split(',').slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-brand-500/10 text-brand-300 text-xs rounded-md">
                        {tag.trim()}
                      </span>
                    )) : (
                      <span className="px-2 py-1 bg-slate-800 text-slate-500 text-xs rounded-md">Untagged</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
              <svg className="w-12 h-12 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="text-xl font-medium text-white mb-1">No documents found</h3>
              <p className="text-slate-400">Try adjusting your search query or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
