import { Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { AboutPage } from "./pages/AboutPage";
import { EditorPage } from "./pages/EditorPage";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
};

export default App;
