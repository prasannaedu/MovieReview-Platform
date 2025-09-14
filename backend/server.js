require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); // Restrict to frontend origin
app.use(express.json());

// Models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Review = require('./models/Review');
const Watchlist = require('./models/Watchlist');


User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

Movie.hasMany(Review, { foreignKey: 'movieId' });
Review.belongsTo(Movie, { foreignKey: 'movieId' });

User.belongsToMany(Movie, { through: Watchlist, foreignKey: 'userId' });
Movie.belongsToMany(User, { through: Watchlist, foreignKey: 'movieId' });

// Middleware for protected routes
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// Sync DB
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synced'))
  .catch(err => console.error('❌ Sync error:', err));

// Routes
app.get('/', (req, res) => res.send('🎬 Movie Review API running '));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/users', require('./routes/users'));

// Protect reviews route
app.use('/api/movies/:id/reviews', authenticateToken, require('./routes/reviews'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));