const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Watchlist = sequelize.define('Watchlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, { timestamps: true });

module.exports = Watchlist;
