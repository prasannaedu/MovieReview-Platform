const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Review = sequelize.define('Review', {
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 },
  },
  comment: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = Review;
