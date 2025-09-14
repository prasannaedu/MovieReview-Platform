// frontend/src/pages/ReviewForm.jsx
import React, { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

export default function ReviewForm({ movieId, onReviewSubmitted }) {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return <p>Please login to write a review.</p>;

  const submitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await API.post(`/movies/${movieId}/reviews`, { rating, comment });
      setRating(0);
      setComment("");
      onReviewSubmitted(); // refresh movie reviews
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitReview} style={{ marginTop: 20 }}>
      <h4>Write a Review</h4>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <label>
        Rating:
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="0">Select</option>
          <option value="1">1 ★</option>
          <option value="2">2 ★</option>
          <option value="3">3 ★</option>
          <option value="4">4 ★</option>
          <option value="5">5 ★</option>
        </select>
      </label>
      <br />
      <textarea
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        rows="3"
        cols="40"
      />
      <br />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
