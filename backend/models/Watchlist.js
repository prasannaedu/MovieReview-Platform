// backend/models/Watchlist.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Watchlist = sequelize.define(
  'Watchlist',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Movies', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  { timestamps: true }
);

module.exports = Watchlist;
