import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TIME_PER_Q = 20;
const CIRCUMFERENCE = 2 * Math.PI * 18;

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

  // ✅ FETCH QUESTIONS (SAFE)
  useEffect(() => {
    axios.get('/api/questions')
      .then(({ data }) => {
        setQuestions(data?.data || []); // ✅ SAFE
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load questions.');
        setLoading(false);
      });
  }, []);

  // ✅ TIMER SAFE
  useEffect(() => {
    if (!questions?.length || revealed) return;

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
  }, [currentQ, questions?.length]);

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
      const q = questions?.[currentQ];
      if (!q) return;

      const { data } = await axios.post('/api/questions/verify', {
        questionId: q._id,
        selected: chosenIdx,
      });

      setCorrectIdx(data?.correctAnswer);
      setExplanation(data?.explanation || '');

      if (data?.isCorrect) setScore(s => s + 1);

      setAnswers(prev => [
        ...prev,
        {
          questionId: q._id,
          selected: chosenIdx,
          correct: data?.isCorrect || false,
          timeTaken: elapsed,
        },
      ]);
    } catch {
      const q = questions?.[currentQ];
      if (!q) return;

      setAnswers(prev => [
        ...prev,
        {
          questionId: q._id,
          selected: chosenIdx,
          correct: false,
          timeTaken: elapsed,
        },
      ]);
    }
  };

  const handleSelect = (idx) => {
    if (revealed) return;
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    revealAnswer(idx, Math.min(elapsed, TIME_PER_Q));
  };

  const handleNext = async () => {
    if (currentQ + 1 >= (questions?.length || 0)) {
      const total = questions?.length || 0;
      const pct = total ? Math.round((score / total) * 100) : 0;
      const avgTime = total
        ? Math.round(answers.reduce((s, a) => s + a.timeTaken, 0) / total)
        : 0;

      try {
        await axios.post('/api/scores', {
          score: pct,
          correct: score,
          total,
          avgTime,
          answers,
        });
      } catch (e) {
        console.error(e);
      }

      navigate('/result', {
        state: { score: pct, correct: score, total, avgTime, answers, questions },
      });

      return;
    }

    setCurrentQ(q => q + 1);
    setSelected(null);
    setRevealed(false);
    setCorrectIdx(null);
    setExplanation('');
  };

  // ✅ SAFE RETURNS
  if (loading)
    return <div className="page-wrap"><div className="spinner" /></div>;

  if (error)
    return <div className="page-wrap"><div className="alert alert-error">{error}</div></div>;

  if (!questions?.length)
    return <div className="page-wrap">No questions</div>;

  const q = questions?.[currentQ];
  if (!q) return null; // ✅ CRASH FIX

  const pct = (timeLeft / TIME_PER_Q) * 100;
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="page-wrap fade-up">
      <h2>{q.questionText}</h2>

      {q?.options?.map((opt, i) => (
        <button key={i} onClick={() => handleSelect(i)}>
          {letters[i]} - {opt}
        </button>
      ))}

      {revealed && (
        <button onClick={handleNext}>
          {currentQ + 1 >= questions.length ? 'Finish' : 'Next'}
        </button>
      )}
    </div>
  );
}