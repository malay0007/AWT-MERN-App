import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TIME_PER_Q = 20;
const API = "https://awt-mern-backend1.onrender.com";

export default function Quiz() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [explanation, setExplanation] = useState('');

  const timerRef = useRef(null);

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
    .catch(() => setLoading(false));
  }, []);

  const revealAnswer = async (idx) => {
    if (revealed) return;

    setSelected(idx);
    setRevealed(true);

    const q = questions[currentQ];

    try {
      const { data } = await axios.post(`${API}/api/questions/verify`, {
        questionId: q._id,
        selected: idx
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('awt_token')}`
        }
      });

      setCorrectIdx(data.correctAnswer);
      setExplanation(data.explanation);
    } catch {}
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      navigate('/result', { state: { questions } });
      return;
    }

    setCurrentQ(currentQ + 1);
    setSelected(null);
    setRevealed(false);
    setCorrectIdx(null);
    setExplanation('');
  };

  if (loading) return <div className="spinner" />;
  if (!questions.length) return <div>No questions</div>;

  const q = questions[currentQ];

  return (
    <div className="page-wrap fade-up">

      {/* TOP BAR */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '20px', fontWeight: 700 }}>
          {String(currentQ + 1).padStart(2, '0')} / {questions.length}
        </span>
      </div>

      {/* CARD */}
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>

        <h3 style={{ marginBottom: '1rem' }}>
          {q.questionText}
        </h3>

        {/* OPTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {q.options.map((opt, i) => {
            let cls = 'btn-ghost';

            if (revealed) {
              if (i === correctIdx) cls = 'btn-success';
              else if (i === selected) cls = 'btn-danger';
            }

            return (
              <button
                key={i}
                className={cls}
                onClick={() => revealAnswer(i)}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* EXPLANATION */}
        {revealed && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: 'var(--muted)' }}>{explanation}</p>

            <button className="btn-primary" onClick={handleNext}>
              {currentQ + 1 >= questions.length ? 'Finish' : 'Next'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}