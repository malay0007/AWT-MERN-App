import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import axios from 'axios'; // ✅ ADD THIS

const CIRCUMFERENCE = 2 * Math.PI * 50;

export default function Result() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const arcRef    = useRef(null);
  const numRef    = useRef(null);

  useEffect(() => {
    if (!state) { navigate('/'); return; }

    const { score = 0, correct = 0, total = 0, avgTime = 0, answers = [] } = state || {};

    // ✅ OPTIONAL: SAVE SCORE (IMPORTANT)
    axios.post('/api/scores', {
      score,
      correct,
      total,
      avgTime,
      answers
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('awt_token')}`
      }
    }).catch(() => {});

    setTimeout(() => {
      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset = CIRCUMFERENCE * (1 - score / 100);
        arcRef.current.style.stroke = score >= 75 ? '#34d399' : score >= 50 ? '#a78bfa' : '#f87171';
      }

      let cur = 0;
      const step = Math.ceil(score / 30);
      const iv = setInterval(() => {
        cur = Math.min(cur + step, score);
        if (numRef.current) numRef.current.textContent = cur + '%';
        if (cur >= score) clearInterval(iv);
      }, 40);
    }, 100);
  }, [state]);

  if (!state || !state.questions) {
    return <div className="page-wrap">No result data</div>;
  }

  const {
    score = 0,
    correct = 0,
    total = 0,
    avgTime = 0,
    answers = [],
    questions = []
  } = state || {};

  const getBadge = () => {
    if (score >= 90) return { text: 'Expert — 90%+', cls: 'badge-green' };
    if (score >= 75) return { text: 'Proficient — 75%+', cls: 'badge-green' };
    if (score >= 60) return { text: 'Competent — 60%+', cls: 'badge-purple' };
    if (score >= 40) return { text: 'Developing — 40%+', cls: 'badge-amber' };
    return { text: 'Needs revision', cls: 'badge-red' };
  };

  const badge = getBadge();
  const emoji = score >= 90 ? '🏆' : score >= 75 ? '🎯' : score >= 60 ? '👍' : score >= 40 ? '📚' : '💪';

  return (
    <div className="page-wrap fade-up" style={{ maxWidth: '580px' }}>
      <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '42px' }}>{emoji}</div>

        <h2>
          {score >= 75 ? 'Well done!' : score >= 50 ? 'Good effort!' : 'Keep practising!'}
        </h2>

        <svg viewBox="0 0 120 120" style={{ width: '130px', margin: '1rem auto' }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle ref={arcRef} cx="60" cy="60" r="50" fill="none" stroke="#a78bfa"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 60 60)"
          />
          <text ref={numRef} x="60" y="60" textAnchor="middle">0%</text>
        </svg>

        <span className={`badge ${badge.cls}`}>{badge.text}</span>

        <div>
          {correct}/{total} correct | Avg: {avgTime}s
        </div>

        <button onClick={() => navigate('/quiz')}>Retry</button>
        <Link to="/leaderboard">Leaderboard</Link>
      </div>

      {(questions || []).map((q, i) => {
        const a = (answers || [])[i];
        return (
          <div key={q._id}>
            {q.questionText}
          </div>
        );
      })}
    </div>
  );
}