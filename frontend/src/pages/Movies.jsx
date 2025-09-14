import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { getPosterUrl } from "../api"; // Import the TMDB helper

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [posters, setPosters] = useState({});
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    year: "",
    rating: "",
  });

  useEffect(() => {
    fetchMovies(1); // reset to page 1 when filters change
    // eslint-disable-next-line
  }, [filters]);

  const fetchMovies = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams();
      if (filters.search) query.append("search", filters.search);
      if (filters.genre) query.append("genre", filters.genre);
      if (filters.year) query.append("year", filters.year);
      if (filters.rating) query.append("minRating", filters.rating);
      query.append("page", page);

      const res = await API.get(`/movies?${query.toString()}`);
      console.log("Movies fetched:", res.data.data); // Debug the response
      setMovies(res.data.data);
      setMeta({
        page: res.data.meta.page,
        totalPages: Math.ceil(res.data.meta.total / res.data.meta.limit),
      });

      // Fetch posters dynamically
      const posterPromises = res.data.data.map(async (movie) => {
        let poster = movie.poster_url || "/no-image.png"; // Fallback to seeded poster_url
        if (movie.tmdbId) {
          poster = await getPosterUrl(movie.tmdbId); // Fetch TMDB poster if tmdbId exists
        }
        return { id: movie.id, poster };
      });
      const posterData = await Promise.all(posterPromises);
      setPosters(posterData.reduce((acc, { id, poster }) => ({ ...acc, [id]: poster }), {}));
    } catch (err) {
      console.error("Movies fetch error:", err.response?.data || err.message);
      setError("Failed to load movies. Please try again.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Movies</h2>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          name="search"
          placeholder="Search by title"
          value={filters.search}
          onChange={handleChange}
        />
        <select name="genre" value={filters.genre} onChange={handleChange}>
          <option value="">All Genres</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Action">Action</option>
          <option value="Drama">Drama</option>
          <option value="Comedy">Comedy</option>
          <option value="Thriller">Thriller</option>
        </select>
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={filters.year}
          onChange={handleChange}
        />
        <select name="rating" value={filters.rating} onChange={handleChange}>
          <option value="">Any Rating</option>
          <option value="9">9+</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="6">6+</option>
        </select>
      </div>

      {/* Movies List */}
      {loading ? (
        <p>Loading movies...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : movies.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {movies.map((m) => (
              <div key={m.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
                <Link to={`/movies/${m.id}`}>
                  <img
                    src={posters[m.id] || "/no-image.png"}
                    alt={m.title}
                    onError={(e) => {
                      e.target.src = "/no-image.png"; // Fallback
                    }}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                  <h4>{m.title} ({m.releaseYear || "N/A"})</h4>
                  <p>{Array.isArray(m.genre) ? m.genre.join(", ") : m.genre}</p>
                  <p>⭐ {m.avgRating || "N/A"}</p>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div style={{ marginTop: 20, display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={() => fetchMovies(meta.page - 1)} disabled={meta.page <= 1}>
              Prev
            </button>
            <span>
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => fetchMovies(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}