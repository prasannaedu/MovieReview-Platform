// backend/seed.js
require("dotenv").config();
const sequelize = require("./config/db"); // your sequelize instance
const User = require("./models/User");
const Movie = require("./models/Movie");
const bcrypt = require("bcryptjs");

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    // force:true will drop & recreate tables — useful for dev seeding
    await sequelize.sync({ force: true });
    console.log("✅ Database synced (force:true)");

    // Seed movies (add extra movies for variety)
    const movies = [
      {
        title: "Edge of Tomorrow",
        genre: ["Sci-Fi", "Action"],
        releaseYear: 2014,
        director: "Doug Liman",
        cast: ["Tom Cruise", "Emily Blunt"],
        synopsis: "A soldier relives the same day in a war against aliens.",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/gfJGljf0h6pmg0k04eelsV3xO3i.jpg",
        tmdbId: 137113,
      },
      {
        title: "The Grand Budapest Hotel",
        genre: ["Comedy", "Drama"],
        releaseYear: 2014,
        director: "Wes Anderson",
        cast: ["Ralph Fiennes"],
        synopsis: "The adventures of a concierge at a famous hotel.",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/9E2A8l6scE9f5r9lOQ5g2z1xZ3x.jpg",
        tmdbId: 120467,
      },
      {
        title: "Interstellar",
        genre: ["Sci-Fi", "Drama"],
        releaseYear: 2014,
        director: "Christopher Nolan",
        cast: ["Matthew McConaughey", "Anne Hathaway"],
        synopsis: "A team of explorers travel through a wormhole in space.",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/gEU2QniE6E6l53S3PmwuWPiCc1I.jpg",
        tmdbId: 157336,
      },
      {
        title: "The Matrix",
        genre: ["Sci-Fi", "Action"],
        releaseYear: 1999,
        director: "The Wachowskis",
        cast: ["Keanu Reeves", "Laurence Fishburne"],
        synopsis:
          "A hacker learns the world is a simulation and joins a rebellion.",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        tmdbId: 603,
      },
      {
        title: "Inception",
        genre: ["Sci-Fi", "Thriller"],
        releaseYear: 2010,
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio"],
        synopsis: "A thief enters people's dreams to steal secrets.",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
        tmdbId: 27205,
      },
      {
        title: "The Shawshank Redemption",
        genre: ["Drama"],
        releaseYear: 1994,
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman"],
        synopsis:
          "Two imprisoned men bond and find redemption over years.",
        posterUrl:
          "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        tmdbId: 278,
      },
    ];

    // Use bulkCreate — ensure your Movie model accepts the keys used above.
    // If your model stores 'genre' as a string, it may need JSON/stringify: adjust accordingly.
    const created = await Movie.bulkCreate(movies, { returning: true });
    console.log(`🎬 Seeded ${created.length} movies`);

    // Seed admin user
    const hash = await bcrypt.hash("password", 10);
    const admin = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: hash,
      isAdmin: true,
    });
    console.log(
      `👤 Admin created (email: ${admin.email}, password: password)`
    );

    console.log("✅ Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err.stack || err);
    process.exit(1);
  }
}

seed();
