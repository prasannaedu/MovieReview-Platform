// backend/routes/movies.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Movie = require('../models/Movie');
const Review = require('../models/Review');
const User = require('../models/User');

//  GET /api/movies?search=&genre=&year=&page=1&limit=12&minRating=0&sort=avgRating&order=DESC
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      genre,
      year,
      page = 1,
      limit = 12,
      minRating,
      sort = 'createdAt', // can also be "avgRating"
      order = 'DESC',
    } = req.query;

    const where = {};

    // 🔍 Title search
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    //  Genre filter (supports single or multiple, comma-separated)
    if (genre) {
      const genres = Array.isArray(genre) ? genre : genre.split(',');
      where.genre = { [Op.overlap]: genres }; // requires ARRAY column in Postgres
    }

    // 📅 Year filter
    if (year) {
      where.releaseYear = parseInt(year);
    }

    // ⭐ Min rating filter
    if (minRating) {
      where.averageRating = { [Op.gte]: parseFloat(minRating) };
    }

    // Pagination
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    // Query
    const { rows: movies, count } = await Movie.findAndCountAll({
      where,
      order: [[sort, order]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      data: movies,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error('GET /movies error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//  GET /api/movies/:id → movie details + reviews
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Fetch reviews + reviewer details
    const reviews = await Review.findAll({
      where: { movieId: movie.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'username'] }],
    });

    res.json({ movie, reviews });
  } catch (err) {
    console.error('GET /movies/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
