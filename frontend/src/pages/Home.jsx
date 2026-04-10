import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myScores, setMyScores] = useState([]);

  useEffect(() => {
    axios
      .get('/api/scores/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('awt_token')}` // ✅ FIX (IMPORTANT)
        }
      })
      .then(({ data }) => {
        setMyScores(data?.data || []);
      })
      .catch(() => {
        setMyScores([]);
      });
  }, []);

  const best =
    (myScores?.length || 0) > 0
      ? Math.max(...myScores.map((s) => s?.score || 0))
      : null;

  const latest = myScores?.[0] || null;

  return (
    <div className="page-wrap fade-up">

      <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '3rem 2rem' }}>
        <span className="badge badge-purple" style={{ marginBottom: '1rem' }}>
          Marwadi University · CE Sem 4
        </span>

        <h1 style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
          AWT<span style={{ color: 'var(--purple)' }}>Quiz</span>
        </h1>

        <p style={{ color: 'var(--muted)', fontSize: '15px', margin: '0.75rem 0 2rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
          Welcome, <strong style={{ color: 'var(--text)' }}>{user?.name || 'User'}</strong>
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/quiz')}>
            Start Quiz →
          </button>
          <Link to="/leaderboard" className="btn-ghost">
            Leaderboard
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Attempts', val: myScores?.length || 0 },
          { label: 'Best score', val: best !== null ? best + '%' : '—' },
          { label: 'Last score', val: latest?.score ? latest.score + '%' : '—' },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, color: val === '—' ? 'var(--muted)' : 'var(--purple)' }}>
              {val}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {(myScores?.length || 0) > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '1rem' }}>
            Recent attempts
          </h3>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Avg time</th>
                </tr>
              </thead>
              <tbody>
                {myScores?.slice(0, 5).map((s, i) => (
                  <tr key={s?._id || i}>
                    <td style={{ color: 'var(--muted)' }}>{i + 1}</td>

                    <td>
                      {s?.createdAt
                        ? new Date(s.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          s?.score >= 75
                            ? 'badge-green'
                            : s?.score >= 50
                            ? 'badge-amber'
                            : 'badge-red'
                        }`}
                      >
                        {s?.score ?? 0}%
                      </span>
                    </td>

                    <td>
                      {s?.correct ?? 0}/{s?.total ?? 0}
                    </td>

                    <td>{s?.avgTime ?? 0}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '1rem' }}>
          Topics covered
        </h3>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['React', 'Node.js', 'Express', 'MongoDB', 'JWT Security', 'bcrypt', 'REST APIs', 'GitHub'].map((t) => (
            <span key={t} className="badge badge-purple" style={{ fontSize: '12px', padding: '5px 12px' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}