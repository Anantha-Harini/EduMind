import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Flashcards() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/documents/', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setDocuments(data))
    .finally(() => setLoading(false));
  }, [user.token]);

  const loadFlashcards = async (docId) => {
    setLoading(true);
    setError(null);
    setSelectedDoc(documents.find(d => d.id === docId));
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const res = await fetch(`http://localhost:8000/api/questions/flashcards/${docId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      const cards = data.flashcards || data || [];
      setFlashcards(Array.isArray(cards) ? cards : []);
      if (Array.isArray(cards) && cards.length === 0) {
        setError('No flashcards could be generated for this document.');
      }
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading AI generated flashcards...</p>
      </div>
    );
  }

  if (!selectedDoc) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">AI Flashcards</h1>
          <p className="text-slate-400 text-lg">Select a document to review key concepts and terms.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map(doc => (
            <div key={doc.id} onClick={() => loadFlashcards(doc.id)} className="glass-card p-6 cursor-pointer group">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">{doc.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{doc.description}</p>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-brand-300 bg-brand-500/10 px-3 py-1 rounded-full">Review Flashcards &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => setSelectedDoc(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Flashcards: {selectedDoc.title}</h1>
          <p className="text-slate-400">Card {currentIndex + 1} of {flashcards.length}</p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {flashcards.length > 0 ? (
          <>
            <div 
              className="w-full h-80 relative cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front Side (Term) */}
                <div 
                  className="absolute w-full h-full glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-brand-400 font-medium mb-4 block tracking-wider uppercase text-sm">Term</span>
                  <h2 className="text-4xl font-bold text-white">{flashcards[currentIndex].term}</h2>
                </div>

                {/* Back Side (Definition) */}
                <div 
                  className="absolute w-full h-full glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-emerald-400 font-medium mb-4 block tracking-wider uppercase text-sm">Definition</span>
                  <p className="text-2xl text-slate-200 leading-relaxed">{flashcards[currentIndex].definition}</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex gap-4 w-full justify-center items-center">
              <button 
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentIndex(prev => Math.max(0, prev - 1)), 150);
                }}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium disabled:opacity-30 transition-colors border border-white/5 flex gap-2 items-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              
              <button 
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentIndex(prev => Math.min(flashcards.length - 1, prev + 1)), 150);
                }}
                disabled={currentIndex === flashcards.length - 1}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-medium disabled:opacity-30 transition-colors flex gap-2 items-center"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <p className="mt-6 text-slate-500 text-sm">Click the card to reveal the answer</p>
          </>
        ) : (
          <div className="text-center py-12 glass-panel rounded-3xl w-full">
            <svg className="w-16 h-16 mx-auto text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-amber-300 font-medium text-lg mb-2">{error || 'No flashcards available.'}</p>
            <p className="text-slate-400 text-sm mb-6">Try again — the AI model may need a moment.</p>
            <button 
              onClick={() => loadFlashcards(selectedDoc.id)} 
              className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium transition-colors"
            >
              Retry Generation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
