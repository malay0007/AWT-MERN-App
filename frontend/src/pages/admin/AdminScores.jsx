import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminScores() {
  const [scores, setScores]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/scores')
      .then(({ data }) => { setScores(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length) : 0;
  const top = scores.length ? Math.max(...scores.map(s => s.score)) : 0;

  return (
    <div className="page-wrap fade-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>All Scores</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{scores.length} total attempts</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total attempts', val: scores.length,    color: 'var(--purple)' },
          { label: 'Average score',  val: avg + '%',        color: 'var(--amber)' },
          { label: 'Top score',      val: top + '%',        color: 'var(--green)' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading && <div className="spinner" />}
        {!loading && !scores.length && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No attempts yet.</p>}
        {!loading && scores.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Student</th><th>Score</th><th>Correct</th><th>Avg time</th><th>Date</th></tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                    <td>
                      {s.user?.name}
                      <br />
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.user?.email}</span>
                    </td>
                    <td>
                      <span className={`badge ${s.score >= 75 ? 'badge-green' : s.score >= 50 ? 'badge-amber' : 'badge-red'}`}>
                        {s.score}%
                      </span>
                    </td>
                    <td>{s.correct}/{s.total}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.avgTime}s</td>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
