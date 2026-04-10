import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 50;

export default function Result() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const arcRef    = useRef(null);
  const numRef    = useRef(null);

  useEffect(() => {
    if (!state) { navigate('/'); return; }
    const { score = 0 } = state || {};
    setTimeout(() => {
      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset = CIRCUMFERENCE * (1 - score / 100);
        arcRef.current.style.stroke = score >= 75 ? '#34d399' : score >= 50 ? '#a78bfa' : '#f87171';
      }
      // Count-up animation
      let cur = 0;
      const step = Math.ceil(score / 30);
      const iv = setInterval(() => {
        cur = Math.min(cur + step, score);
        if (numRef.current) numRef.current.textContent = cur + '%';
        if (cur >= score) clearInterval(iv);
      }, 40);
    }, 100);
  }, [state]);

  // ✅ SAFE GUARD (FIXED)
  if (!state || !state.questions) {
    return <div className="page-wrap">No result data</div>;
  }

  // ✅ SAFE DESTRUCTURING (FIXED)
  const {
    score = 0,
    correct = 0,
    total = 0,
    avgTime = 0,
    answers = [],
    questions = []
  } = state || {};

  const getBadge = () => {
    if (score >= 90) return { text: 'Expert — 90%+',      cls: 'badge-green' };
    if (score >= 75) return { text: 'Proficient — 75%+',  cls: 'badge-green' };
    if (score >= 60) return { text: 'Competent — 60%+',   cls: 'badge-purple' };
    if (score >= 40) return { text: 'Developing — 40%+',  cls: 'badge-amber' };
    return                 { text: 'Needs revision',       cls: 'badge-red' };
  };

  const badge = getBadge();
  const emoji = score >= 90 ? '🏆' : score >= 75 ? '🎯' : score >= 60 ? '👍' : score >= 40 ? '📚' : '💪';

  return (
    <div className="page-wrap fade-up" style={{ maxWidth: '580px' }}>
      {/* Score ring */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '42px', marginBottom: '0.5rem' }}>{emoji}</div>
        <h2 style={{ fontSize: '24px', marginBottom: '0.25rem' }}>
          {score >= 75 ? 'Well done!' : score >= 50 ? 'Good effort!' : 'Keep practising!'}
        </h2>
        <svg viewBox="0 0 120 120" style={{ width: '130px', height: '130px', margin: '1rem auto', display: 'block' }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle ref={arcRef} cx="60" cy="60" r="50" fill="none" stroke="#a78bfa" strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE}
            strokeLinecap="round" transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1), stroke 0.5s' }} />
          <text ref={numRef} x="60" y="55" textAnchor="middle"
            style={{ fill: 'var(--text)', fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800 }}>0%</text>
          <text x="60" y="73" textAnchor="middle"
            style={{ fill: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '10px' }}>
            {correct}/{total} correct
          </text>
        </svg>
        <span className={`badge ${badge.cls}`} style={{ fontSize: '13px', padding: '5px 16px' }}>{badge.text}</span>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', margin: '1.5rem 0' }}>
          {[
            { label: 'Correct', val: correct, color: 'var(--green)' },
            { label: 'Wrong',   val: total - correct, color: 'var(--red)' },
            { label: 'Avg time', val: avgTime + 's', color: 'var(--amber)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'var(--bg3)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/quiz')}>Try again →</button>
          <Link to="/leaderboard" className="btn-ghost">Leaderboard</Link>
          <Link to="/" className="btn-ghost">Home</Link>
        </div>
      </div>

      {/* Answer review */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '1rem' }}>Answer review</h3>

        {/* ✅ SAFE MAP (FIXED) */}
        {(questions || []).map((q, i) => {
          const a = (answers || [])[i];
          const isCorrect = a?.correct;
          return (
            <div key={q._id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`} style={{ flexShrink: 0 }}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{q.questionText}</span>
              </div>

              {!isCorrect && a?.selected !== -1 && (
                <div style={{ fontSize: '12px', paddingLeft: '4px' }}>
                  <span style={{ color: 'var(--red)' }}>
                    Your answer: {(q.options || [])[a?.selected]}
                  </span>
                </div>
              )}

              {a?.selected === -1 && (
                <div style={{ fontSize: '12px', color: 'var(--amber)', paddingLeft: '4px' }}>
                  Time's up — no answer given
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}