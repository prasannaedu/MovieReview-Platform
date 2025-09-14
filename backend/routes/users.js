const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Movie = require("../models/Movie");
const Review = require("../models/Review");
const Watchlist = require("../models/Watchlist");
const auth = require("../middleware/auth");

//  GET user profile (with reviews + watchlist)
router.get("/:id", auth, async (req, res) => {
  try {
    if (req.user.id != req.params.id) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Review,
          include: [{ model: Movie, attributes: ["id", "title", "posterUrl"] }],
        },
        {
          model: Movie, // through watchlist
          as: "Movies",
          through: { attributes: [] },
          attributes: ["id", "title", "posterUrl"],
        },
      ],
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      reviews: user.Reviews?.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        movieId: r.Movie?.id,
        movieTitle: r.Movie?.title,
        createdAt: r.createdAt,
      })),
      watchlist: user.Movies?.map((m) => ({
        movieId: m.id,
        movieTitle: m.title,
        posterUrl: m.posterUrl,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.id != req.params.id) return res.status(403).json({ msg: "Forbidden" });

    await User.update(req.body, { where: { id: req.params.id } });
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(updatedUser);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});


router.get("/:id/watchlist", auth, async (req, res) => {
  try {
    if (req.user.id != req.params.id) return res.status(403).json({ msg: "Forbidden" });

    const user = await User.findByPk(req.params.id, {
      include: [{ model: Movie, as: "Movies", through: { attributes: [] } }],
    });

    res.json({ watchlist: user ? user.Movies : [] });
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});


router.post("/:id/watchlist", auth, async (req, res) => {
  try {
    if (req.user.id != req.params.id) return res.status(403).json({ msg: "Forbidden" });

    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ msg: "Movie ID is required" });

    const user = await User.findByPk(req.params.id);
    const movie = await Movie.findByPk(movieId);

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!movie) return res.status(404).json({ msg: "Movie not found" });

    await user.addMovie(movie);
    const updatedWatchlist = await user.getMovies();
    res.json({ msg: "Added to watchlist", watchlist: updatedWatchlist });
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});


router.delete("/:id/watchlist/:movieId", auth, async (req, res) => {
  try {
    if (req.user.id != req.params.id) return res.status(403).json({ msg: "Forbidden" });

    const user = await User.findByPk(req.params.id);
    const movie = await Movie.findByPk(req.params.movieId);

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!movie) return res.status(404).json({ msg: "Movie not found" });

    await user.removeMovie(movie);
    const updatedWatchlist = await user.getMovies();
    res.json({ msg: "Removed from watchlist", watchlist: updatedWatchlist });
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

module.exports = router;
