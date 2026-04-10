import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Leaderboard() {
  const [scores, setScores]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/scores/leaderboard', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('awt_token')}` // ✅ FIX
      }
    })
      .then(({ data }) => { 
        setScores(data?.data || []);
        setLoading(false); 
      })
      .catch(() => {
        setScores([]);
        setLoading(false);
      });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page-wrap fade-up" style={{ maxWidth: '580px' }}>
      <div className="card">
        <h2 style={{ fontSize: '24px', marginBottom: '0.25rem' }}>Leaderboard</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
          Top 20 all-time scores
        </p>

        {loading && <div className="spinner" />}

        {!loading && !(scores?.length) && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
            No scores yet. Be the first to take the quiz!
          </p>
        )}

        {!loading && scores?.map((s, i) => (
          <div key={s?._id || i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px', background: 'var(--bg3)',
            border: `1px solid ${i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--border)'}`,
            borderRadius: '14px', marginBottom: '8px',
            background: i === 0 ? 'rgba(251,191,36,0.05)' : i === 1 ? 'rgba(148,163,184,0.05)' : i === 2 ? 'rgba(205,127,50,0.05)' : 'var(--bg3)',
          }}>
            <span style={{ width: '28px', fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 800 }}>
              {i < 3 ? medals[i] : `#${i + 1}`}
            </span>

            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--purple-dim)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
              {s?.user?.name ? s.user.name.slice(0, 2).toUpperCase() : "??"}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {s?.user?.name || "Anonymous"}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {s?.createdAt 
                  ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                  : '—'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--purple)' }}>
                {s?.score ?? 0}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {s?.correct ?? 0}/{s?.total ?? 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}