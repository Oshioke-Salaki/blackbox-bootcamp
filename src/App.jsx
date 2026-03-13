import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CurriculumPage from "./pages/CurriculumPage";
import HomeworkPage from "./pages/HomeworkPage";
import ResourcesPage from "./pages/ResourcesPage";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
      <Footer />
    </>
  );
}
