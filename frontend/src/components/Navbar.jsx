// frontend/src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 24px",
      background: "#222",
      color: "#fff"
    }}>
      <h2><Link to="/" style={{ color: "#fff", textDecoration: "none" }}>🎬 Movie Reviews</Link></h2>
      <div style={{ display: "flex", gap: "16px" }}>
        <Link to="/" style={{ color: "#fff" }}>Home</Link>
        <Link to="/movies" style={{ color: "#fff" }}>Movies</Link>
        {user ? (
          <>
            <Link to="/profile" style={{ color: "#fff" }}>Profile</Link>
            <button onClick={handleLogout} style={{ background: "red", color: "#fff", border: "none", padding: "6px 12px", cursor: "pointer" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#fff" }}>Login</Link>
            <Link to="/register" style={{ color: "#fff" }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
