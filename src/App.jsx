import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./page/login";
import Register from "./page/register";
import Home from "./page/home";
import Ranking from "./page/ranking";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/ranking" element={<Ranking />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
