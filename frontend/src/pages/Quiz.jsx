import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TIME_PER_Q   = 20;
const CIRCUMFERENCE = 2 * Math.PI * 18; // r=18

export default function Quiz() {
  const navigate = useNavigate();
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [currentQ, setCurrentQ]     = useState(0);
  const [selected, setSelected]     = useState(null);   // index chosen
  const [revealed, setRevealed]     = useState(false);  // show correct answer
  const [correctIdx, setCorrectIdx] = useState(null);   // from verify API
  const [explanation, setExplanation] = useState('');
  const [timeLeft, setTimeLeft]     = useState(TIME_PER_Q);
  const [answers, setAnswers]       = useState([]);     // {questionId, selected, correct, timeTaken}
  const [score, setScore]           = useState(0);
  const timerRef  = useRef(null);
  const startRef  = useRef(Date.now());

  useEffect(() => {
    axios.get('/api/questions')
      .then(({ data }) => { setQuestions(data.data); setLoading(false); })
      .catch(() => { setError('Failed to load questions. Please try again.'); setLoading(false); });
  }, []);

  // Start timer when question loads
  useEffect(() => {
    if (!questions.length || revealed) return;
    startRef.current = Date.now();
    setTimeLeft(TIME_PER_Q);

    const tick = () => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleExpire(); return 0; }
        return prev - 1;
      });
    };
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, questions.length]);

  const handleExpire = () => {
    clearInterval(timerRef.current);
    if (revealed) return;
    revealAnswer(-1, 0); // timed out
  };

  const revealAnswer = async (chosenIdx, elapsed) => {
    clearInterval(timerRef.current);
    setSelected(chosenIdx);
    setRevealed(true);

    // Ask the backend for the correct answer + explanation
    try {
      const q = questions[currentQ];
      const { data } = await axios.post('/api/questions/verify', {
        questionId: q._id, selected: chosenIdx,
      });
      setCorrectIdx(data.correctAnswer);
      setExplanation(data.explanation);
      const isCorrect = data.isCorrect;
      if (isCorrect) setScore(s => s + 1);
      setAnswers(prev => [...prev, {
        questionId: q._id, selected: chosenIdx,
        correct: isCorrect, timeTaken: elapsed,
      }]);
    } catch {
      // Fallback if verify endpoint unavailable
      setAnswers(prev => [...prev, {
        questionId: questions[currentQ]._id,
        selected: chosenIdx, correct: false, timeTaken: elapsed,
      }]);
    }
  };

  const handleSelect = (idx) => {
    if (revealed) return;
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    revealAnswer(idx, Math.min(elapsed, TIME_PER_Q));
  };

  const handleNext = async () => {
    if (currentQ + 1 >= questions.length) {
      // Submit to backend
      const total   = questions.length;
      const correct = answers.filter(a => a.correct).length + (answers.length < total ? 0 : 0);
      const pct     = Math.round((score / total) * 100);
      const avgTime = Math.round(answers.reduce((s, a) => s + a.timeTaken, 0) / total);
      try {
        await axios.post('/api/scores', { score: pct, correct: score, total, avgTime, answers });
      } catch (e) { console.error('Score submit failed', e); }
      navigate('/result', { state: { score: pct, correct: score, total, avgTime, answers, questions } });
      return;
    }
    setCurrentQ(q => q + 1);
    setSelected(null);
    setRevealed(false);
    setCorrectIdx(null);
    setExplanation('');
  };

  if (loading) return <div className="page-wrap"><div className="spinner" /></div>;
  if (error)   return <div className="page-wrap"><div className="alert alert-error">{error}</div></div>;
  if (!questions.length) return <div className="page-wrap"><p style={{ color: 'var(--muted)' }}>No questions available.</p></div>;

  const q      = questions[currentQ];
  const pct    = (timeLeft / TIME_PER_Q) * 100;
  const offset = CIRCUMFERENCE * (1 - pct / 100);
  const ringColor = timeLeft > 10 ? '#a78bfa' : timeLeft > 5 ? '#fbbf24' : '#f87171';
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="page-wrap fade-up" style={{ maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '36px', fontWeight: 800, color: 'var(--purple)', lineHeight: 1 }}>
            {String(currentQ + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '16px', color: 'var(--muted)' }}>/ {questions.length}</span>
          <span className="badge badge-purple" style={{ marginLeft: '8px' }}>{q.category}</span>
        </div>
        {/* Timer ring */}
        <div style={{ position: 'relative', width: '44px', height: '44px' }}>
          <svg viewBox="0 0 44 44" style={{ width: '44px', height: '44px' }}>
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle cx="22" cy="22" r="18" fill="none" stroke={ringColor} strokeWidth="3"
              strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 22 22)"
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontSize: '13px', fontWeight: 700 }}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: '2px', width: `${(currentQ / questions.length) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Question card */}
      <div className="card">
        <p style={{ fontSize: '17px', lineHeight: 1.65, marginBottom: '1.5rem' }}>{q.questionText}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {q.options.map((opt, i) => {
            let bg = 'var(--bg3)', border = 'var(--border)', color = 'var(--text)';
            if (revealed) {
              if (i === correctIdx)                          { bg = 'rgba(52,211,153,0.12)'; border = 'var(--green)'; color = 'var(--green)'; }
              else if (i === selected && i !== correctIdx)  { bg = 'rgba(248,113,113,0.1)'; border = 'var(--red)'; color = 'var(--red)'; }
            }
            return (
              <button key={i} disabled={revealed}
                onClick={() => handleSelect(i)}
                style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: bg,
                  border: `1px solid ${border}`, borderRadius: '12px', color, fontSize: '14px',
                  fontFamily: 'var(--font-body)', cursor: revealed ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  transform: !revealed ? undefined : 'none',
                  transition: 'border-color 0.15s, background 0.15s' }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-head)', color: 'inherit' }}>
                  {letters[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && explanation && (
          <div style={{ marginTop: '1.25rem', padding: '14px 16px', background: 'rgba(167,139,250,0.07)', borderLeft: '3px solid var(--purple)', borderRadius: '0 10px 10px 0', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, animation: 'fadeUp 0.3s ease' }}>
            {selected === -1 ? '⏱ Time\'s up! ' : (selected === correctIdx ? '✓ ' : '✗ ')}{explanation}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '0 4px' }}>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Score: <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{score}</span>
        </span>
        {revealed && (
          <button className="btn-primary" onClick={handleNext} style={{ animation: 'fadeUp 0.25s ease' }}>
            {currentQ + 1 >= questions.length ? 'See results →' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
}
