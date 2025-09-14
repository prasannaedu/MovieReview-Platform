// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Movies from "./pages/Movies";
import MoviePage from "./pages/MoviePage";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Watchlist from "./pages/Watchlist";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthContext";
import { useContext } from "react";

// ✅ ProtectedRoute wrapper
function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <p style={{ padding: 20 }}>Please log in to view this page.</p>;
  }
  return children;
}

function App() {
  const { login } = useContext(AuthContext);

  const handleLogin = (userData, token) => {
    login(userData, token); // update context when user logs in
  };

  return (
    <Router>
      <div>
        {/* Global Navbar */}
        <Navbar />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MoviePage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
