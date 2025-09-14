// frontend/src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wlLoading, setWlLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, token]);

  const removeFromWatchlist = async (movieId) => {
    if (!user) return;
    setWlLoading(true);
    try {
      await API.delete(`/users/${user.id}/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile((p) => ({
        ...p,
        watchlist: (p.watchlist || []).filter((m) => String(m.movieId) !== String(movieId)),
      }));
    } catch (err) {
      console.error("Remove watchlist:", err.response?.data || err.message);
      setError("Failed to remove from watchlist");
    } finally {
      setWlLoading(false);
    }
  };

  if (!user) return <p>Please login to view your profile.</p>;
  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>{profile?.username}'s Profile</h2>
      <p>Email: {profile?.email}</p>
      <p>Joined: {new Date(profile?.createdAt).toLocaleDateString()}</p>

      {/* Reviews Section */}
      <section style={{ marginTop: 30 }}>
        <h3>Your Reviews</h3>
        {profile?.reviews?.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {profile.reviews.map((r) => (
              <div
                key={r.id}
                style={{
                  width: 250,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  background: "#fafafa",
                }}
              >
                <Link to={`/movies/${r.movieId}`} style={{ textDecoration: "none", color: "#000" }}>
                  <strong>{r.movieTitle}</strong>
                </Link>
                <p>⭐ {r.rating}/5</p>
                <p style={{ fontStyle: "italic" }}>{r.comment}</p>
                <small>{new Date(r.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </section>

      {/* Watchlist Section */}
      <section style={{ marginTop: 40 }}>
        <h3>Your Watchlist</h3>
        {profile?.watchlist?.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {profile.watchlist.map((m) => (
              <div
                key={m.movieId}
                style={{ width: 200, textAlign: "center" }}
              >
                <Link to={`/movies/${m.movieId}`} style={{ textDecoration: "none", color: "#000" }}>
                  {m.posterUrl ? (
                    <img
                      src={m.posterUrl}
                      alt={m.movieTitle}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: 280, background: "#eee", borderRadius: 8 }} />
                  )}
                  <p><strong>{m.movieTitle}</strong></p>
                </Link>
                <button
                  onClick={() => removeFromWatchlist(m.movieId)}
                  disabled={wlLoading}
                  style={{
                    marginTop: 6,
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  {wlLoading ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Your watchlist is empty.</p>
        )}
      </section>
    </div>
  );
}
