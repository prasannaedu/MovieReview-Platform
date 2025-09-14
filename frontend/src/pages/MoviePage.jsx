// frontend/src/pages/MoviePage.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import API, { getMovieDetails, getPosterUrl } from "../api";
import ReviewForm from "./ReviewForm";
import { AuthContext } from "../context/AuthContext";

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [wlLoading, setWlLoading] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);
  const [poster, setPoster] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/movies/${id}`);
      const payloadMovie = res.data.movie || res.data;
      const payloadReviews = res.data.reviews || res.data.reviews || [];

      setMovie(payloadMovie);
      setReviews(payloadReviews);

      // Poster: use posterUrl or TMDB
      if (payloadMovie.tmdbId) {
        const p = await getPosterUrl(payloadMovie.tmdbId);
        if (p) setPoster(p);
        else setPoster(payloadMovie.posterUrl || null);
      } else {
        setPoster(payloadMovie.posterUrl || null);
      }

      // TMDB details (trailer & cast)
      if (payloadMovie.tmdbId) {
        const details = await getMovieDetails(payloadMovie.tmdbId);
        setTrailerKey(details.trailerKey);
        setCast(details.cast);
      } else {
        setTrailerKey(null);
        setCast([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // check watchlist membership if user present
  useEffect(() => {
    if (!user || !movie) {
      setInWatchlist(false);
      return;
    }

    if (user.watchlist && Array.isArray(user.watchlist)) {
      setInWatchlist(user.watchlist.some((m) => String(m.movieId ?? m.id ?? m) === String(movie.id)));
    } else {
      (async () => {
        try {
          const res = await API.get(`/users/${user.id}`);
          const list = res.data.watchlist || [];
          setInWatchlist(list.some((m) => String(m.movieId) === String(movie.id)));
        } catch (err) {
          console.warn("Could not fetch watchlist:", err.response?.data || err.message);
        }
      })();
    }
  }, [user, movie]);

  const addToWatchlist = async () => {
    if (!user) {
      setError("Please login to add to watchlist.");
      return;
    }
    setWlLoading(true);
    try {
      await API.post(`/users/${user.id}/watchlist`, { movieId: movie.id });
      setInWatchlist(true);
    } catch (err) {
      console.error("Add watchlist error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to add watchlist");
    } finally {
      setWlLoading(false);
    }
  };

  const removeFromWatchlist = async () => {
    if (!user) {
      setError("Please login.");
      return;
    }
    setWlLoading(true);
    try {
      await API.delete(`/users/${user.id}/watchlist/${movie.id}`);
      setInWatchlist(false);
    } catch (err) {
      console.error("Remove watchlist error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to remove from watchlist");
    } finally {
      setWlLoading(false);
    }
  };

  if (loading) return <p>Loading movie...</p>;
  if (error) return <p>Error loading movie: {error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 220px" }}>
          <img src={poster || movie.posterUrl || "/no-image.png"} alt={movie.title} style={{ width: 220, borderRadius: 8 }} />
          <p style={{ marginTop: 8 }}>Rating: {movie.avgRating ?? "N/A"}</p>

          <div style={{ marginTop: 12 }}>
            {inWatchlist ? (
              <button onClick={removeFromWatchlist} disabled={wlLoading}>
                {wlLoading ? "Removing..." : "Remove from Watchlist"}
              </button>
            ) : (
              <button onClick={addToWatchlist} disabled={wlLoading}>
                {wlLoading ? "Adding..." : "Add to Watchlist"}
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2>{movie.title} ({movie.releaseYear || ""})</h2>
          <p><strong>Director:</strong> {movie.director || "N/A"}</p>
          <p><strong>Cast:</strong> {Array.isArray(movie.cast) && movie.cast.length ? movie.cast.join(", ") : "N/A"}</p>
          <p style={{ marginTop: 12 }}>{movie.synopsis || "No description available"}</p>

          {trailerKey && (
            <div style={{ marginTop: 16 }}>
              <h4>Trailer</h4>
              <div style={{ position: "relative", paddingTop: "56.25%" }}>
                <iframe
                  title="Trailer"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {cast && cast.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>Top Cast</h4>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {cast.map((c) => (
                  <div key={c.id} style={{ width: 120, textAlign: "center" }}>
                    <img
                      src={c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "/no-image.png"}
                      alt={c.name}
                      style={{ width: "100%", borderRadius: 6 }}
                    />
                    <div style={{ fontSize: 12 }}>
                      <strong>{c.name}</strong>
                      <div style={{ fontSize: 11 }}>{c.character}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 style={{ marginTop: 20 }}>Reviews</h3>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id || review._id} style={{ marginBottom: "10px" }}>
                <p>
                  <strong>{review.User?.username || review.username || "User"}</strong>
                </p>
                <p>Rating: {review.rating} ★</p>
                <p>{review.comment || review.text}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}

          <ReviewForm movieId={id} onReviewSubmitted={fetchData} />
        </div>
      </div>
    </div>
  );
}
