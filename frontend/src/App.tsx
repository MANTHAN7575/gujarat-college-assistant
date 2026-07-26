import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import CollegeDetailPage from "./pages/CollegeDetailPage";
import ComparePage from "./pages/ComparePage";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/college/:id" element={<CollegeDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
