import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TIME_PER_Q = 20;
const API = "https://awt-mern-backend1.onrender.com";

export default function Quiz() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [explanation, setExplanation] = useState('');

  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);

  const startRef = useRef(Date.now());

  // FETCH QUESTIONS
  useEffect(() => {
    axios.get(`${API}/api/questions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('awt_token')}`
      }
    })
    .then(({ data }) => {
      setQuestions(data?.data || []);
      setLoading(false);
    })
    .catch(() => {
      setError('Failed to load questions.');
      setLoading(false);
    });
  }, []);

  const revealAnswer = async (chosenIdx, elapsed) => {
    setSelected(chosenIdx);
    setRevealed(true);

    try {
      const q = questions[currentQ];

      const { data } = await axios.post(`${API}/api/questions/verify`, {
        questionId: q._id,
        selected: chosenIdx,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('awt_token')}`
        }
      });

      setCorrectIdx(data.correctAnswer);
      setExplanation(data.explanation || '');

      if (data.isCorrect) setScore(s => s + 1);

      setAnswers(prev => [...prev, {
        questionId: q._id,
        selected: chosenIdx,
        correct: data.isCorrect,
        timeTaken: elapsed,
      }]);

    } catch {}
  };

  const handleSelect = (idx) => {
    if (revealed) return;
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    revealAnswer(idx, elapsed);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      const total = questions.length;
      const pct = Math.round((score / total) * 100);

      navigate('/result', {
        state: { score: pct, correct: score, total, answers, questions },
      });
      return;
    }

    setCurrentQ(q => q + 1);
    setSelected(null);
    setRevealed(false);
    setCorrectIdx(null);
    setExplanation('');
    startRef.current = Date.now();
  };

  if (loading) return <div className="page-wrap"><div className="spinner" /></div>;
  if (error) return <div className="page-wrap">{error}</div>;
  if (!questions.length) return <div className="page-wrap">No questions</div>;

  const q = questions[currentQ];

  return (
    <div className="page-wrap fade-up" style={{ maxWidth: '600px', margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Question {currentQ + 1} / {questions.length}
        </h3>
      </div>

      {/* CARD */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '24px'
      }}>

        <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>
          {q.questionText}
        </h2>

        {/* OPTIONS */}
        {(q.options || []).map((opt, i) => {
          let bg = 'var(--bg3)';
          let border = '1px solid var(--border)';

          if (revealed) {
            if (i === correctIdx) {
              bg = '#064e3b';
              border = '1px solid #34d399';
            } else if (i === selected) {
              bg = '#7f1d1d';
              border = '1px solid #f87171';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: '10px',
                borderRadius: '12px',
                background: bg,
                border: border,
                color: 'white',
                textAlign: 'left',
                fontSize: '14px',
                transition: '0.2s'
              }}
            >
              {opt}
            </button>
          );
        })}

        {/* EXPLANATION */}
        {revealed && (
          <div style={{
            marginTop: '16px',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid var(--purple)'
          }}>
            <strong style={{ color: 'var(--purple)' }}>Reason:</strong>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>
              {explanation}
            </div>
          </div>
        )}

        {/* NEXT BUTTON */}
        {revealed && (
          <button
            onClick={handleNext}
            style={{
              marginTop: '18px',
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              border: 'none',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {currentQ + 1 >= questions.length ? 'Finish →' : 'Next →'}
          </button>
        )}

      </div>
    </div>
  );
}