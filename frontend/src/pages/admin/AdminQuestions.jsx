import { useState, useEffect } from 'react';
import axios from 'axios';

const EMPTY = { category: 'React', questionText: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' };
const CATS  = ['React', 'Node.js', 'Express', 'MongoDB', 'Security', 'GitHub', 'General'];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null); // question _id
  const [form, setForm]           = useState(EMPTY);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const load = () => {
    setLoading(true);
    axios.get('/api/questions/admin')
      .then(({ data }) => { setQuestions(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(''); setShowForm(true); };
  const openEdit   = (q) => {
    setForm({ category: q.category, questionText: q.questionText, options: [...q.options], correctAnswer: q.correctAnswer, explanation: q.explanation });
    setEditing(q._id); setError(''); setShowForm(true);
  };

  const handleOption = (i, val) => {
    const opts = [...form.options]; opts[i] = val; setForm({ ...form, options: opts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.questionText.trim()) { setError('Question text is required'); return; }
    if (form.options.some(o => !o.trim())) { setError('All 4 options are required'); return; }
    if (!form.explanation.trim()) { setError('Explanation is required'); return; }
    try {
      if (editing) {
        await axios.put(`/api/questions/${editing}`, form);
        setSuccess('Question updated!');
      } else {
        await axios.post('/api/questions', form);
        setSuccess('Question created!');
      }
      setShowForm(false); load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await axios.delete(`/api/questions/${id}`);
      setSuccess('Question deleted'); load();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Delete failed'); }
  };

  return (
    <div className="page-wrap fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Questions</h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{questions.length} total</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add question</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '1.25rem' }}>
            {editing ? 'Edit question' : 'New question'}
          </h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Correct answer (0–3)</label>
                <select className="form-select" value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: +e.target.value })}>
                  {[0,1,2,3].map(i => <option key={i} value={i}>Option {i+1} ({['A','B','C','D'][i]})</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Question text</label>
              <textarea className="form-textarea" value={form.questionText}
                onChange={e => setForm({ ...form, questionText: e.target.value })} placeholder="Write the question here..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
              {form.options.map((opt, i) => (
                <div key={i} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Option {['A','B','C','D'][i]}{i === form.correctAnswer ? ' ✓ correct' : ''}</label>
                  <input className="form-input" value={opt} onChange={e => handleOption(i, e.target.value)} placeholder={`Option ${['A','B','C','D'][i]}`} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Explanation</label>
              <textarea className="form-textarea" value={form.explanation}
                onChange={e => setForm({ ...form, explanation: e.target.value })} placeholder="Explain why the correct answer is correct..." />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Questions list */}
      {loading && <div className="spinner" />}
      {!loading && questions.map((q, i) => (
        <div key={q._id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>#{i+1}</span>
                <span className="badge badge-purple">{q.category}</span>
                <span className={`badge ${q.isActive ? 'badge-green' : 'badge-red'}`}>{q.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '8px' }}>{q.questionText}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {q.options.map((opt, oi) => (
                  <span key={oi} style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '20px',
                    background: oi === q.correctAnswer ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
                    color: oi === q.correctAnswer ? 'var(--green)' : 'var(--muted)',
                    border: `1px solid ${oi === q.correctAnswer ? 'rgba(52,211,153,0.3)' : 'transparent'}` }}>
                    {['A','B','C','D'][oi]}. {opt}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => openEdit(q)}>Edit</button>
              <button className="btn-danger" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleDelete(q._id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
