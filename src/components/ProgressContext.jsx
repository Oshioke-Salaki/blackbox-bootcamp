/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const ProgressContext = createContext();

const STORAGE_KEY = "fhevm-bootcamp-progress";

function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markComplete = (lessonId) => {
    setProgress((prev) => ({ ...prev, [lessonId]: true }));
  };

  const isComplete = (lessonId) => !!progress[lessonId];

  const getWeekProgress = (weekId, totalLessons) => {
    let completed = 0;
    for (let i = 1; i <= totalLessons; i++) {
      if (progress[`${weekId}-lesson-${i}`]) completed++;
    }
    return { completed, total: totalLessons, percent: Math.round((completed / totalLessons) * 100) };
  };

  const getTotalProgress = (weeks) => {
    let total = 0;
    let completed = 0;
    for (const w of weeks) {
      total += w.lessons;
      for (let i = 1; i <= w.lessons; i++) {
        if (progress[`${w.id}-lesson-${i}`]) completed++;
      }
    }
    return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProgressContext.Provider
      value={{ progress, markComplete, isComplete, getWeekProgress, getTotalProgress, resetProgress }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
