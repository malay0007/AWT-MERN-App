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

  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);

  const timerRef = useRef(null);
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

  // TIMER
  useEffect(() => {
    if (!(questions?.length > 0) || revealed) return;

    startRef.current = Date.now();
    setTimeLeft(TIME_PER_Q);

    const tick = () => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    };

    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, questions?.length, revealed]);

  const handleExpire = () => {
    clearInterval(timerRef.current);
    if (revealed) return;
    revealAnswer(-1, 0);
  };

  const revealAnswer = async (chosenIdx, elapsed) => {
    clearInterval(timerRef.current);
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
      setExplanation(data.explanation);

      if (data.isCorrect) setScore(s => s + 1);

      setAnswers(prev => [...prev, {
        questionId: q._id,
        selected: chosenIdx,
        correct: data.isCorrect,
        timeTaken: elapsed
      }]);

    } catch {}
  };

  const handleSelect = (idx) => {
    if (revealed) return;
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    revealAnswer(idx, Math.min(elapsed, TIME_PER_Q));
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      navigate('/result', {
        state: { score, answers, questions }
      });
      return;
    }

    setCurrentQ(q => q + 1);
    setSelected(null);
    setRevealed(false);
    setCorrectIdx(null);
    setExplanation('');
  };

  if (loading) return <div className="page-wrap"><div className="spinner" /></div>;
  if (error) return <div className="page-wrap">{error}</div>;
  if (!questions.length) return <div className="page-wrap">No questions</div>;

  const q = questions[currentQ];
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="page-wrap fade-up">

      <h2 style={{ marginBottom: '1.5rem' }}>{q.questionText}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--bg2)';

          if (revealed) {
            if (i === correctIdx) bg = '#065f46'; // green
            else if (i === selected) bg = '#7f1d1d'; // red
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: bg,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {letters[i]}. {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--bg2)',
            borderRadius: '10px'
          }}>
            <strong>Explanation:</strong>
            <p>{explanation}</p>
          </div>

          <button
            onClick={handleNext}
            style={{ marginTop: '1rem' }}
            className="btn-primary"
          >
            {currentQ + 1 >= questions.length ? 'Finish' : 'Next'}
          </button>
        </>
      )}
    </div>
  );
}