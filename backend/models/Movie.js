// backend/models/Movie.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Movie = sequelize.define(
  'Movie',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genre: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    releaseYear: {
      type: DataTypes.INTEGER,
    },
    director: {
      type: DataTypes.STRING,
    },
    cast: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    synopsis: {
      type: DataTypes.TEXT,
    },
    posterUrl: {
      type: DataTypes.STRING,
    },
    tmdbId: {
      type: DataTypes.INTEGER,
    },
    trailer: {
      // store YouTube key or full URL (string)
      type: DataTypes.STRING,
    },
    avgRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Movie;
