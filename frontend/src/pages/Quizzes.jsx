import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Quizzes() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch documents that the user has viewed or all approved documents
    fetch('http://localhost:8000/api/documents/', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    .then(res => res.json())
    .then(data => setDocuments(data))
    .finally(() => setLoading(false));
  }, [user.token]);

  const loadQuiz = async (docId) => {
    setLoading(true);
    setSelectedDoc(documents.find(d => d.id === docId));
    setQuizFinished(false);
    setAnswers({});
    setCurrentQ(0);
    setError('');
    try {
      // First try to get existing questions
      let res = await fetch(`http://localhost:8000/api/questions/${docId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      let data = await res.json();
      
      // If no questions exist, generate them
      if (!data || data.length === 0) {
        res = await fetch(`http://localhost:8000/api/questions/generate/${docId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to generate quiz. The AI may be temporarily unavailable.');
        }
        const genData = await res.json();
        data = genData.questions || genData || [];
      }
      
      // Normalize question field names (DB uses question_text, AI returns question)
      const normalized = (Array.isArray(data) ? data : []).map(q => ({
        ...q,
        question_text: q.question_text || q.question,
        options: q.options || [],
        answer: q.answer || ''
      }));
      
      if (normalized.length === 0) {
        setError('No questions could be generated. The AI service may be rate-limited. Please try again in a minute.');
      }
      
      setQuestions(normalized);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load quiz.');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option) => {
    setAnswers({ ...answers, [currentQ]: option });
  };

  const submitQuiz = async () => {
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) finalScore++;
    });
    setScore(finalScore);
    setQuizFinished(true);
    
    try {
      await fetch('http://localhost:8000/api/questions/results', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_id: selectedDoc.id,
          score: finalScore,
          total_questions: questions.length
        })
      });
    } catch (e) {
      console.error("Failed to submit score", e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading AI generated questions...</p>
      </div>
    );
  }

  if (!selectedDoc) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">AI Quizzes</h1>
          <p className="text-slate-400 text-lg">Select a document to test your knowledge.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map(doc => (
            <div key={doc.id} onClick={() => loadQuiz(doc.id)} className="glass-card p-6 cursor-pointer group">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">{doc.title}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{doc.description}</p>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-brand-300 bg-brand-500/10 px-3 py-1 rounded-full">Take Quiz &rarr;</span>
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
          <h1 className="text-3xl font-bold text-white tracking-tight">Quiz: {selectedDoc.title}</h1>
          <p className="text-slate-400">Question {currentQ + 1} of {questions.length}</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        {quizFinished ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
              <span className="text-3xl font-bold text-white">{Math.round((score / questions.length) * 100)}%</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
            <p className="text-slate-400 mb-8">You scored {score} out of {questions.length} correctly.</p>
            <button onClick={() => setSelectedDoc(null)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium border border-white/10">
              Return to Quizzes
            </button>
          </div>
        ) : questions.length > 0 ? (
          <motion.div 
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">{questions[currentQ].question_text}</h2>
            <div className="space-y-3">
              {questions[currentQ].options ? questions[currentQ].options.map((opt, i) => (
                <div 
                  key={i} 
                  onClick={() => handleAnswer(opt)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[currentQ] === opt 
                      ? 'border-brand-500 bg-brand-500/20 text-brand-100' 
                      : 'border-white/10 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:border-white/20'
                  }`}
                >
                  <span className="font-medium mr-3 text-slate-500">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </div>
              )) : (
                <p className="text-red-400">Options missing for this question. It might not be an MCQ.</p>
              )}
            </div>

            <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
              <button 
                onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                disabled={currentQ === 0}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium disabled:opacity-30 transition-colors border border-white/5"
              >
                Previous
              </button>
              
              {currentQ === questions.length - 1 ? (
                <button 
                  onClick={submitQuiz}
                  disabled={!answers[currentQ]}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all"
                >
                  Finish Quiz
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentQ(prev => prev + 1)}
                  disabled={!answers[currentQ]}
                  className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-medium disabled:opacity-30 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-amber-300 font-medium text-lg mb-2">{error || 'Failed to generate questions.'}</p>
            <p className="text-slate-400 text-sm mb-6">This usually happens when the Gemini API is rate-limited. Try again in a moment.</p>
            <button 
              onClick={() => loadQuiz(selectedDoc.id)} 
              className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium transition-colors"
            >
              Retry Quiz Generation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
