// frontend/src/pages/Watchlist.jsx
import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Watchlist() {
  const { user, token } = useContext(AuthContext);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await API.get(`/users/${user.id}/watchlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(res.data.watchlist || []);
      } catch (err) {
        console.error("Fetch watchlist error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [user, token]);

  const removeFromWatchlist = async (movieId) => {
    try {
      await API.delete(`/users/${user.id}/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err) {
      console.error("Remove watchlist error:", err.response?.data || err.message);
    }
  };

  if (loading) return <p>Loading watchlist...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Watchlist</h2>
      {watchlist.length === 0 ? (
        <p>Your watchlist is empty.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {watchlist.map((m) => (
            <div key={m.id} style={{ width: 200 }}>
              <Link to={`/movies/${m.id}`} style={{ textDecoration: "none", color: "#000" }}>
                <img
                  src={m.posterUrl}
                  alt={m.title}
                  style={{ width: "100%", borderRadius: 8 }}
                />
                <p><strong>{m.title}</strong></p>
                {m.releaseYear && <p>{m.releaseYear}</p>}
              </Link>
              <button
                onClick={() => removeFromWatchlist(m.id)}
                style={{
                  marginTop: 8,
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
