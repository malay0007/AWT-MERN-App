import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 50;

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const arcRef = useRef(null);
  const numRef = useRef(null);

  useEffect(() => {
    if (!state) {
      navigate('/');
      return;
    }

    const { score = 0 } = state;

    setTimeout(() => {
      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset =
          CIRCUMFERENCE * (1 - score / 100);

        arcRef.current.style.stroke =
          score >= 75
            ? '#34d399'
            : score >= 50
            ? '#a78bfa'
            : '#f87171';
      }

      let cur = 0;
      const step = Math.ceil(score / 30);

      const iv = setInterval(() => {
        cur = Math.min(cur + step, score);

        if (numRef.current) {
          numRef.current.textContent = cur + '%';
        }

        if (cur >= score) clearInterval(iv);
      }, 40);
    }, 150);
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
    questions = [],
  } = state;

  const wrong = total - correct;

  const getBadge = () => {
    if (score >= 90) return { text: 'Expert', cls: '#34d399' };
    if (score >= 75) return { text: 'Proficient', cls: '#34d399' };
    if (score >= 60) return { text: 'Competent', cls: '#a78bfa' };
    if (score >= 40) return { text: 'Developing', cls: '#fbbf24' };
    return { text: 'Needs revision', cls: '#f87171' };
  };

  const badge = getBadge();

  const emoji =
    score >= 90 ? '🏆' :
    score >= 75 ? '🎯' :
    score >= 60 ? '👍' :
    score >= 40 ? '📚' : '💪';

  return (
    <div
      className="page-wrap fade-up"
      style={{
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '2rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '42px', marginBottom: '10px' }}>
          {emoji}
        </div>

        <h2 style={{ marginBottom: '1rem' }}>
          {score >= 75
            ? 'Well done!'
            : score >= 50
            ? 'Good effort!'
            : 'Keep practising!'}
        </h2>

        <svg
          viewBox="0 0 120 120"
          style={{
            width: '140px',
            margin: '1rem auto',
            display: 'block',
          }}
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />

          <circle
            ref={arcRef}
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 60 60)"
            style={{
              transition: 'all 1s ease',
            }}
          />

          <text
            ref={numRef}
            x="60"
            y="55"
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontWeight="bold"
          >
            0%
          </text>

          <text
            x="60"
            y="72"
            textAnchor="middle"
            fill="#888"
            fontSize="8"
          >
            quiz score
          </text>
        </svg>

        <div
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '999px',
            background: badge.cls + '20',
            color: badge.cls,
            fontWeight: 600,
            fontSize: '13px',
            marginBottom: '1.5rem',
          }}
        >
          {badge.text}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <div className="card">
            <h3 style={{ color: '#34d399' }}>{correct}</h3>
            <p>Correct</p>
          </div>

          <div className="card">
            <h3 style={{ color: '#f87171' }}>{wrong}</h3>
            <p>Wrong</p>
          </div>

          <div className="card">
            <h3 style={{ color: '#fbbf24' }}>{avgTime}s</h3>
            <p>Avg time</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn-primary"
            onClick={() => navigate('/quiz')}
          >
            Try Again →
          </button>

          <Link className="btn-ghost" to="/leaderboard">
            Leaderboard
          </Link>

          <Link className="btn-ghost" to="/">
            Home
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>
          Answer Review
        </h3>

        {questions.map((q, i) => {
          const a = answers[i];

          return (
            <div
              key={q._id}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  color: a?.correct ? '#34d399' : '#f87171',
                  fontWeight: 500,
                  marginBottom: '5px',
                }}
              >
                {a?.correct ? '✔' : '✖'} {q.questionText}
              </div>

              {!a?.correct && (
                <div
                  style={{
                    fontSize: '13px',
                    color: '#aaa',
                    paddingLeft: '20px',
                  }}
                >
                  Your answer: {q.options[a?.selected] || 'Not Answered'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}