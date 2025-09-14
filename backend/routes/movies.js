// backend/routes/movies.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Movie = require('../models/Movie');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

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
      sort = 'createdAt', // or "avgRating"
      order = 'DESC',
    } = req.query;

    const where = {};

    // Title search
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }

    // Genre filter (supports comma-separated list)
    if (genre) {
      const genres = Array.isArray(genre) ? genre : genre.split(',');
      where.genre = { [Op.overlap]: genres };
    }

    // Year filter
    if (year) {
      where.releaseYear = parseInt(year);
    }

    // Min rating filter (use avgRating field)
    if (minRating) {
      where.avgRating = { [Op.gte]: parseFloat(minRating) };
    }

    // Pagination
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    // Determine sort column
    const allowedSort = ['createdAt', 'avgRating', 'releaseYear', 'title'];
    const sortColumn = allowedSort.includes(sort) ? sort : 'createdAt';

    const { rows: movies, count } = await Movie.findAndCountAll({
      where,
      order: [[sortColumn, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
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

// POST /api/movies - Add a new movie (admin only)
router.post('/', auth, async (req, res) => {
  try {
    // verify admin
    const requester = await User.findByPk(req.user.id);
    if (!requester || !requester.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const {
      title,
      genre = [],
      releaseYear,
      director,
      cast = [],
      synopsis,
      posterUrl,
      tmdbId,
      trailer,
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    const movie = await Movie.create({
      title,
      genre,
      releaseYear,
      director,
      cast,
      synopsis,
      posterUrl,
      tmdbId,
      trailer,
    });

    res.status(201).json({ message: 'Movie created', movie });
  } catch (err) {
    console.error('POST /movies error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
