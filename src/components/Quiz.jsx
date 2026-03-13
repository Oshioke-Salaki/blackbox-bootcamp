import { useState } from "react";

export default function Quiz({ questions, onPass }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const q = questions[current];

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setShowResult(true);
    if (selected === q.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    setSelected(null);
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
    } else {
      setCompleted(true);
      const finalScore = selected === q.correct ? score + 1 : score;
      if (finalScore === questions.length && onPass) onPass();
    }
  };

  if (completed) {
    const passed = score === questions.length;
    return (
      <div className="quiz-container">
        <div className="quiz-result">
          <div className="quiz-score" data-passed={passed}>
            {score}/{questions.length}
          </div>
          <p>
            {passed
              ? "All correct. You can mark this lesson complete."
              : "Review the material and try again."}
          </p>
          {!passed && (
            <button
              className="btn-outline"
              onClick={() => {
                setCurrent(0);
                setSelected(null);
                setShowResult(false);
                setScore(0);
                setCompleted(false);
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <span className="tag tag-accent">Knowledge Check</span>
        <span className="quiz-progress">
          {current + 1} / {questions.length}
        </span>
      </div>
      <p className="quiz-question">{q.question}</p>
      <div className="quiz-options">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            className={`quiz-option${selected === idx ? " selected" : ""}${
              showResult && idx === q.correct ? " correct" : ""
            }${showResult && selected === idx && idx !== q.correct ? " wrong" : ""}`}
            onClick={() => handleSelect(idx)}
          >
            <span className="quiz-option-letter">
              {String.fromCharCode(65 + idx)}
            </span>
            {opt}
          </button>
        ))}
      </div>
      {showResult && (
        <div className="quiz-explanation">
          <p>{q.explanation}</p>
        </div>
      )}
      <div className="quiz-actions">
        {!showResult ? (
          <button
            className="btn-primary"
            onClick={handleCheck}
            disabled={selected === null}
          >
            Check Answer
          </button>
        ) : (
          <button className="btn-primary" onClick={handleNext}>
            {current + 1 < questions.length ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
