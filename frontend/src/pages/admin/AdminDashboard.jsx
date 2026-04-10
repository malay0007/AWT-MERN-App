import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ questions: 0, scores: 0, users: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/questions/admin'),
      axios.get('/api/scores'),
    ]).then(([q, s]) => {
      setStats({ questions: q.data.count, scores: s.data.count });
      setRecent(s.data.data.slice(0, 5));
    }).catch(() => {});
  }, []);

  return (
    <div className="page-wrap fade-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Welcome, {user?.name}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total questions', val: stats.questions, color: 'var(--purple)' },
          { label: 'Total attempts',  val: stats.scores,    color: 'var(--green)' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '36px', fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/admin/questions" className="btn-primary">Manage questions →</Link>
        <Link to="/admin/scores"    className="btn-ghost">View all scores</Link>
      </div>

      {/* Recent scores */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '1rem' }}>Recent quiz attempts</h3>
        {!recent.length && <p style={{ color: 'var(--muted)', fontSize: '13px' }}>No attempts yet.</p>}
        {recent.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Score</th><th>Correct</th><th>Date</th></tr></thead>
              <tbody>
                {recent.map(s => (
                  <tr key={s._id}>
                    <td>{s.user?.name}<br /><span style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.user?.email}</span></td>
                    <td><span className={`badge ${s.score >= 75 ? 'badge-green' : s.score >= 50 ? 'badge-amber' : 'badge-red'}`}>{s.score}%</span></td>
                    <td>{s.correct}/{s.total}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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
