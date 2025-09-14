// frontend/src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token automatically if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Fetch poster from TMDB
export const getPosterUrl = async (tmdbId) => {
  if (!tmdbId || !TMDB_API_KEY) return null;
  try {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`;
    const res = await axios.get(url);
    const posterPath = res.data.poster_path;
    return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
  } catch (err) {
    console.error("TMDB poster error:", err.response?.data || err.message);
    return null;
  }
};

// Fetch movie details (videos + credits) from TMDB
export const getMovieDetails = async (tmdbId) => {
  if (!tmdbId || !TMDB_API_KEY) return { trailerKey: null, cast: [] };
  try {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`;
    const res = await axios.get(url);
    // Trailer: first YouTube trailer
    const videos = res.data.videos?.results || [];
    const ytTrailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");
    const trailerKey = ytTrailer?.key || null;

    // Cast: take first 6 cast members
    const cast = (res.data.credits?.cast || []).slice(0, 6).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path,
    }));

    return { trailerKey, cast };
  } catch (err) {
    console.error("TMDB details error:", err.response?.data || err.message);
    return { trailerKey: null, cast: [] };
  }
};

export default API;
