import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { getPosterUrl } from "../api"; // Import the TMDB helper

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [posters, setPosters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/movies?page=1&limit=6");
      console.log("Featured movies fetched:", res.data.data); // Debug the response
      setMovies(res.data.data.slice(0, 6));

      const posterPromises = res.data.data.map(async (movie) => {
        let poster = movie.poster_url || "/no-image.png"; // Fallback to seeded poster_url or local image
        if (movie.tmdbId) {
          poster = await getPosterUrl(movie.tmdbId); // Fetch TMDB poster if tmdbId exists
        }
        return { id: movie.id, poster };
      });
      const posterData = await Promise.all(posterPromises);
      setPosters(posterData.reduce((acc, { id, poster }) => ({ ...acc, [id]: poster }), {}));
    } catch (err) {
      console.error("Error loading movies or posters:", err);
      setError("Failed to load movies or posters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎬 Movies</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {movies.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                textAlign: "center",
              }}
            >
              <Link to={`/movies/${m.id}`}>
                <img
                  src={posters[m.id] || "/no-image.png"}
                  alt={m.title}
                  onError={(e) => {
                    e.target.src = "/no-image.png"; // Ensure fallback
                  }}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <h4 style={{ marginTop: 10 }}>
                  {m.title} ({m.releaseYear || "N/A"})
                </h4>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}