import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function DocumentViewer() {
  const { docId } = useParams();
  const { user } = useAuth();
  
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am EduMind AI. How can I help you understand this document?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'raw', 'discussions'
  const [rawContent, setRawContent] = useState('');
  const [rawContentLoading, setRawContentLoading] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${docId}/comments`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/documents/${docId}/view`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDoc(data);
          setUpvotes(data.upvote_count || 0);
          setBookmarked(data.is_bookmarked || false);
          setHasUpvoted(data.has_upvoted || false);
        }
        loadComments();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [docId, user.token]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${docId}/comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        loadComments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chatbot/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ query: userMsg, document_id: parseInt(docId) })
      });
      
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error answering your question.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        // Toggle bookmark off
        const res = await fetch(`http://localhost:8000/api/bookmarks/${docId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) setBookmarked(false);
      } else {
        // Toggle bookmark on
        const res = await fetch('http://localhost:8000/api/bookmarks', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id: parseInt(docId) })
        });
        if (res.ok) setBookmarked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpvote = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${docId}/upvote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUpvotes(data.upvote_count);
        setHasUpvoted(data.action === "added");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center mt-20 text-slate-500">Loading document...</div>;
  if (!doc) return <div className="text-center mt-20 text-red-500">Document not found or access denied.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Left Pane: Document Info / Preview */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{doc.title}</h1>
            <div className="flex items-center gap-2">
              <button onClick={handleUpvote} className={`px-3 py-1 flex items-center gap-1 rounded-lg text-sm font-medium transition-colors ${hasUpvoted ? 'bg-brand-500/20 text-brand-400 border border-brand-500/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-transparent'}`}>
                <svg className="w-4 h-4" fill={hasUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                {upvotes}
              </button>
              <button onClick={handleBookmark} className={`px-3 py-1 flex items-center gap-1 rounded-lg text-sm font-medium transition-colors ${bookmarked ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-transparent'}`}>
                <svg className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                {bookmarked ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-md">
              {doc.file_type?.toUpperCase()}
            </span>
            <span>Views: {doc.view_count}</span>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex gap-4 mb-4 border-b border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('summary')}
              className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'summary' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              AI Summary
            </button>
            <button 
              onClick={async () => {
                setActiveTab('raw');
                if (!rawContent && !rawContentLoading) {
                  setRawContentLoading(true);
                  try {
                    const res = await fetch(`http://localhost:8000/api/documents/${docId}/content`, {
                      headers: { 'Authorization': `Bearer ${user.token}` }
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setRawContent(data.text);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setRawContentLoading(false);
                  }
                }
              }}
              className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'raw' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Raw Document
            </button>
            <button 
              onClick={() => setActiveTab('discussions')}
              className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'discussions' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Discussions
            </button>
          </div>
          
          {activeTab === 'summary' ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-600 dark:text-slate-300 leading-relaxed shadow-inner">
              {doc.summary || "No summary available."}
            </div>
          ) : activeTab === 'raw' ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-600 dark:text-slate-300 leading-relaxed shadow-inner font-mono text-sm whitespace-pre-wrap">
              {rawContentLoading ? "Loading raw text..." : (rawContent || "No raw text available.")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment or ask a question..."
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:border-brand-500"
                />
                <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors">
                  Post
                </button>
              </form>
              <div className="space-y-4 mt-2">
                {commentsLoading ? (
                  <p className="text-slate-400 text-sm">Loading discussions...</p>
                ) : comments.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">No discussions yet. Be the first to comment!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{c.user_name}</span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{c.user_role}</span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {doc.tags?.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: AI Chatbot */}
      <div className="w-full lg:w-96 glass rounded-2xl flex flex-col overflow-hidden border-t-4 border-t-purple-500 shadow-xl shadow-purple-500/10">
        <div className="p-4 bg-white/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="font-semibold text-lg">AI Assistant</h2>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {chatHistory.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`max-w-[85%] p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white self-end rounded-tr-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 self-start rounded-tl-sm'
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
          {chatLoading && (
            <div className="self-start bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}} />
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleChat} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full pl-4 pr-12 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all"
            />
            <button 
              type="submit"
              disabled={chatLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
