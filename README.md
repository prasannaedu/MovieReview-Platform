# Movie Review Platform

## Overview
A full-stack movie review platform built with React, Node.js, Express, and PostgreSQL. This project allows users to browse movies, submit reviews, manage watchlists, and view profiles, with authentication and TMDB integration for posters, trailers, and cast details.

## Features
- **Movie Browsing**: Search movies with filters (genre, year, rating) and pagination, displaying posters from TMDB.
- **Movie Details**: View detailed pages with synopsis, average rating, reviews, watchlist options, trailers, and cast information.
- **Review System**: Authenticated users can submit ratings (1-5) and comments, with real-time average rating updates.
- **User Authentication**: Register, login, and logout functionality with JWT-based authentication.
- **Profile Management**: View and edit user profiles, including reviews and watchlist.
- **Watchlist Management**: Add or remove movies from a dedicated watchlist page.
- **Admin Functionality**: Add new movies (in progress, admin-only).
- **TMDB Integration**: Fetch posters, trailers, and cast using the TMDB API.

## Tech Stack
- **Frontend**: React (Vite), React Router, Context API
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt for password hashing
- **APIs**: TMDB for movie posters, trailers, and cast

## Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Git

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/prasannaedu/MovieReview-Platform.git
   cd MovieReview-Platform
   ```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```text
PORT=5000
JWT_SECRET=your-secure-secret-key
DATABASE_URL=postgres://username:password@localhost:5432/moviedb
```

Setup the database:
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
node seed.js
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```text
VITE_API_URL=http://localhost:5000/api
VITE_TMDB_API_KEY=your-tmdb-api-key
```

Start the development server:
```bash
npm run dev
```

## API Endpoints

### Movies
- `GET /api/movies` → List movies with pagination and filters
- `GET /api/movies/:id` → Movie details
- `POST /api/movies/:id/reviews` → Submit review (authenticated)
- `GET /api/movies/:id/reviews` → Fetch reviews
- `POST /api/movies` → Add new movie (admin-only, in progress)

### Users
- `POST /api/auth/register` → Register new user
- `POST /api/auth/login` → Login
- `GET /api/users/:id` → User profile with reviews & watchlist
- `PUT /api/users/:id` → Update profile
- `GET /api/users/:id/watchlist` → Fetch watchlist
- `POST /api/users/:id/watchlist` → Add to watchlist
- `DELETE /api/users/:id/watchlist/:movieId` → Remove from watchlist

## Notes & Design Decisions
- PostgreSQL with Sequelize ORM for Users, Movies, Reviews, and Watchlist.
- JWT authentication and bcrypt password hashing.
- React frontend with Context API for auth state management.
- Error boundaries on frontend and robust error handling on backend.
- Environment variables used for sensitive configs.
- TMDB API for posters, trailers, and cast details.
- Pagination and filtering for scalability.
- Admin routes partially implemented.

## Future Improvements
- Complete Admin Dashboard for managing movies/users.
- Deploy backend (Render/Heroku) and frontend (Vercel/Netlify).
- Enhance UI with Tailwind or Material-UI.
- Add recommendation system and social features (user following).

## Repository
GitHub Repo: [MovieReview-Platform](https://github.com/prasannaedu/MovieReview-Platform)
