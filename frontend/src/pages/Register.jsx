import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1px' }}>
            AWT<span style={{ color: 'var(--purple)' }}>Quiz</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '6px' }}>
            Create your student account
          </p>
        </div>
        <div className="card fade-up">
          <h2 style={{ fontSize: '20px', marginBottom: '1.5rem' }}>Register</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input name="name" type="text" className="form-input"
                placeholder="Your name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input name="email" type="email" className="form-input"
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-input"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input name="confirm" type="password" className="form-input"
                placeholder="Repeat password" value={form.confirm} onChange={handleChange} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted)', marginTop: '1.25rem' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--purple)', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
