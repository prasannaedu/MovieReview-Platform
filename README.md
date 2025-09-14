# Movie Review Platform

## Overview
A full-stack movie review platform built with React, Node.js, Express, and PostgreSQL. This project allows users to browse movies, submit reviews, manage watchlists, and view profiles, with authentication and TMDB integration for posters.

## Features
- Browse movies with search, filters (genre, year, rating), and pagination.
- View detailed movie pages with reviews and watchlist options.
- User authentication (register, login, logout).
- Profile page to view reviews and watchlist.
- Admin functionality for adding movies (in progress).
- TMDB API integration for movie posters.

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

Navigate to the backend/ directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in backend/ with:
```text
PORT=5000
JWT_SECRET=your-secure-secret-key
DATABASE_URL=postgres://username:password@localhost:5432/moviedb
```

Set up the database:
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

Seed data (movies + admin user):
```bash
node seed.js
```

Start the server:
```bash
npm run dev
```

### Frontend Setup

Navigate to the frontend/ directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in frontend/ with:
```text
VITE_API_URL=http://localhost:5000/api
VITE_TMDB_API_KEY=your-tmdb-api-key
```

Start the development server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/movies` → List movies with pagination and filters.
- `GET /api/movies/:id` → Get movie details.
- `POST /api/movies/:id/reviews` → Submit a review (authenticated).
- `GET /api/movies/:id/reviews` → Fetch reviews for a movie.
- `POST /api/auth/register` → Register a new user.
- `POST /api/auth/login` → Log in a user.
- `GET /api/users/:id` → Fetch user profile with reviews + watchlist.
- `PUT /api/users/:id` → Update user profile.
- `GET /api/users/:id/watchlist` → Fetch user watchlist.
- `POST /api/users/:id/watchlist` → Add to watchlist.
- `DELETE /api/users/:id/watchlist/:movieId` → Remove from watchlist.

## Notes & Design Decisions

- **Database**: Used PostgreSQL with Sequelize ORM for structured data and relationships (Users, Movies, Reviews, Watchlist).  
- **Authentication**: Implemented with JWT (JSON Web Token). Passwords are hashed using bcrypt.  
- **Frontend**: Built with React (Vite), React Router for navigation, and Context for auth state management.  
- **Error Handling**: Implemented error boundaries on frontend and try/catch with proper status codes in backend.  
- **Environment Variables**: All sensitive configs (DB URL, JWT secret, TMDB API key) are stored in `.env` and never pushed to Git.  
- **Movie Posters**: Pulled from TMDB API.  
- **Scalability**: Pagination included for movie listing. Filtering supported by genre, year, rating.  
- **Security**: Routes secured with middleware (`auth.js`) and access checks (user can only update own profile, watchlist).  
- **Future Improvements**:  
  - Add an Admin Dashboard for managing movies/users.  
  - Deploy the app on a service like Render/Heroku + Vercel/Netlify.  
  - Enhance UI with Material-UI or Tailwind for better UX.  
  - Recommendation system (based on ratings) and social features (following users).  

## Repository

GitHub Repo: [MovieReview-Platform](https://github.com/prasannaedu/MovieReview-Platform)
