  // frontend/src/pages/MoviePage.jsx
  import React, { useEffect, useState, useCallback, useContext } from "react";
  import { useParams } from "react-router-dom";
  import API from "../api";
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

    const fetchData = useCallback(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/movies/${id}`);
        // Expect res.data.movie and res.data.reviews OR res.data
        if (res.data.movie) {
          setMovie(res.data.movie);
          setReviews(res.data.reviews || []);
        } else {
          // fallback
          setMovie(res.data);
          // fetch reviews separately if not included
          const rv = await API.get(`/movies/${id}/reviews`);
          setReviews(rv.data.reviews || rv.data || []);
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

      // If user.watchlist exists on user object (common), check it; otherwise fetch
      if (user.watchlist && Array.isArray(user.watchlist)) {
        setInWatchlist(user.watchlist.some((m) => String(m.movieId ?? m.id ?? m) === String(movie.id)));
      } else {
        // try fetch user's watchlist quickly
        (async () => {
          try {
            const res = await API.get(`/users/${user.id}/watchlist`);
            const list = res.data.watchlist || res.data || [];
            setInWatchlist(list.some((m) => String(m.movieId ?? m.id ?? m) === String(movie.id)));
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
        <h2>{movie.title}</h2>
        <p>{movie.synopsis || "No description available"}</p>
        <p>Rating: {movie.avgRating ?? "N/A"}</p>
        {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} width="150" />}

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
    );
  }
