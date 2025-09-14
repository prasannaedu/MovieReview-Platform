// frontend/src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useContext(AuthContext);
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
        const res = await API.get(`/users/${user.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const removeFromWatchlist = async (movieId) => {
    if (!user) return;
    setWlLoading(true);
    try {
      await API.delete(`/users/${user.id}/watchlist/${movieId}`);
      // update local state
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
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>{profile?.username}'s Profile</h2>
      <p>Email: {profile?.email}</p>
      <p>Joined: {new Date(profile?.createdAt).toLocaleDateString()}</p>

      {/* Reviews Section */}
      <section style={{ marginTop: 20 }}>
        <h3>Your Reviews</h3>
        {profile?.reviews?.length > 0 ? (
          profile.reviews.map((r) => (
            <div key={r.id} style={{ marginBottom: 12 }}>
              <Link to={`/movies/${r.movieId}`}><strong>{r.movieTitle}</strong></Link>
              <p>Rating: {r.rating} ★</p>
              <p>{r.comment}</p>
              <small>{new Date(r.createdAt).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </section>

      {/* Watchlist Section */}
      <section style={{ marginTop: 20 }}>
        <h3>Your Watchlist</h3>
        {profile?.watchlist?.length > 0 ? (
          profile.watchlist.map((m) => (
            <div key={m.movieId} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              {m.posterUrl ? (
                <img src={m.posterUrl} alt={m.movieTitle} width="80" />
              ) : (
                <div style={{ width: 80, height: 120, background: "#eee" }} />
              )}
              <div style={{ flex: 1 }}>
                <Link to={`/movies/${m.movieId}`}><strong>{m.movieTitle}</strong></Link>
                <div>
                  <button onClick={() => removeFromWatchlist(m.movieId)} disabled={wlLoading}>
                    {wlLoading ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Your watchlist is empty.</p>
        )}
      </section>
    </div>
  );
}
