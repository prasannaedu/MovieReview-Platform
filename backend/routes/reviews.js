// backend/routes/reviews.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/Review");
const Movie = require("../models/Movie");
const User = require("../models/User");
const auth = require("../middleware/auth");

//  GET all reviews for a movie
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { movieId: req.params.id },
      order: [["createdAt", "DESC"]],
      include: [{ model: User, attributes: ["id", "username"] }],
    });

    res.json({ reviews });
  } catch (err) {
    console.error("GET reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//  POST a new review
router.post("/", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1–5" });
    }

    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    // create review
    const review = await Review.create({
      userId: req.user.id,
      movieId: req.params.id,
      rating,
      comment,
    });

    // recalc avg rating
    const stats = await Review.findAll({
      where: { movieId: req.params.id },
      attributes: [
        [Review.sequelize.fn("AVG", Review.sequelize.col("rating")), "avg"],
      ],
      raw: true,
    });
    const avgRating = parseFloat(stats[0].avg).toFixed(1);

    await movie.update({ avgRating });

    res.status(201).json({ review, avgRating });
  } catch (err) {
    console.error("POST review error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
