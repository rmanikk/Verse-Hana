🎵 VerseHana

A mood-driven music platform built to make music discovery feel personal.

VerseHana is a full-stack music streaming and discovery web application designed around one simple idea: music should match how you feel.

Instead of treating music discovery as only a search problem, VerseHana organizes the experience around moods, genres, artists, playlists, lyrics, and listening history. The application also includes authentication, personalized user features, and an admin dashboard for managing the platform's music catalog.

✨ What is VerseHana?

VerseHana combines a modern React frontend with a Node.js/Express backend and MongoDB database.

Users can:

Discover music through moods and genres

Search for songs

Explore trending music powered by Audius

View artists and playlists

Play music through the global music player

Like songs

Track recently played music

Create and manage playlists

View lyrics

Manage their profile and preferred mood

Securely create an account, log in, and reset their password

Administrators get a dedicated dashboard for managing the platform's catalog and monitoring platform activity.

🎯 Main Idea

Most music platforms focus heavily on search, charts, and recommendations.

VerseHana takes a more emotional approach:

How are you feeling? → Choose a mood → Discover music that fits the moment.

The landing page introduces this concept through mood-based discovery, featured playlists, artists, lyrics, community content, and calls to action before users enter the authenticated experience.

🚀 Features

🎭 Mood-Based Discovery

VerseHana includes moods such as:

😊 Happy

😌 Calm

🌧️ Rain

🌙 Night

❤️ Love

💪 Focus

🎉 Party

😢 Sad

Each mood can be used as a starting point for discovering music.

🎵 Music Discovery

The application supports:

Trending tracks

Mood-based music discovery

Genre-based discovery

Music search

Playlists

Artist discovery

Audius is used as an external music source for discovery features such as trending tracks, mood searches, genre searches, and track searches.

▶️ Global Music Player

The music player is implemented through a shared React player context, allowing playback state to remain available across the application.

❤️ Liked Songs

Authenticated users can like and unlike songs and access their liked-song collection.

🕘 Recently Played

Listening activity can be stored and retrieved so users can revisit tracks they have recently played.

📚 Playlists

Users can:

Create playlists

View playlists

Open playlist details

Add songs to playlists

Remove songs from playlists

Delete playlists

🎤 Lyrics

VerseHana includes lyric functionality as part of its music experience, with lyrics represented in the backend catalog.

👤 User Accounts

Authentication includes:

User registration

Login

Logout

Authentication persistence through cookies

Current-user authentication checks

Password reset flow

Role-based access

🛠️ Admin Dashboard

The application includes an administrator-only dashboard with catalog and management functionality.

The backend provides management operations for resources including:

Songs

Artists

Moods

Genres

Lyrics

Users

Playlists

Audit/activity information

📱 Responsive Interface

The frontend is designed to work across:

Desktop screens

Laptops

Tablets

Mobile devices

The landing page, navigation, cards, dashboard, profile area, mood selection, and footer were designed with responsive layouts in mind.

🧰 Tech Stack

Frontend

Technology

Purpose

React

UI development

Vite

Development and production build tooling

React Router

Client-side routing

Tailwind CSS

Styling and responsive layouts

Framer Motion

Animations and interactions

React Icons

UI icons

Recharts

Dashboard/data visualization

Lucide React

Additional interface icons

Backend

Technology

Purpose

Node.js

Backend runtime

Express

REST API server

MongoDB

Database

Mongoose

MongoDB object modeling

JWT

Authentication

bcryptjs

Password hashing

Cookie Parser

Authentication cookie handling

CORS

Frontend/backend communication

dotenv

Environment configuration

External Service

Audius API is used for music discovery and track data.

🏗️ Project Architecture

VerseHana/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── Home/
│   │   ├── layout/
│   │   └── music/
│   │
│   ├── config/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── PlayerContext.jsx
│   │
│   ├── data/
│   ├── pages/
│   ├── styles/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── versehana-black.png
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── server.js
│
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md

🗺️ Frontend Routes

Public

/                   Landing page
/login              Login
/signup             Signup
/forgot-password    Forgot password
/reset-password     Reset password

Authenticated User Routes

/dashboard
/profile
/mood
/discover
/genres
/liked-songs
/recently-played
/playlists
/playlists/:playlistId

Admin

/admin

The admin route is protected using the application's role-based ProtectedRoute.

🔌 Backend API

The backend exposes REST endpoints under /api.

Authentication

/api/auth

Handles account registration, login, logout, authentication checks, and password-related flows.

Music / Audius

/api/music/trending
/api/music/mood/:mood
/api/music/search
/api/music/genre/:genre

Likes

/api/likes
/api/likes/:songId

Playlists

/api/playlists
/api/playlists/:playlistId

Listening History

/api/history

Administration

/api/admin

The admin API provides management operations for platform resources and catalog data.

🗄️ Database Models

The backend currently contains MongoDB/Mongoose models for:

User

Song

Artist

Mood

Genre

Lyric

Playlist

Like

History

AuditLog

This structure separates user activity from the platform's music catalog and administrative records.

🔐 Authentication & Security

VerseHana uses authenticated API requests with cookies and role-based route protection.

Important security-related implementation details include:

Passwords are hashed with bcryptjs

Authentication uses JWT-based sessions

Cookies are used for authentication state

Protected routes prevent unauthenticated access to user pages

Admin routes require the appropriate user role

CORS is configured between the frontend and backend

Environment variables are used for secrets and API credentials

Never commit your real .env file or API keys to GitHub.

Recommended .gitignore entries include:

.env
.env.*
backend/.env

If a secret has already been pushed to a public repository, rotate that credential immediately.

⚙️ Environment Variables

The exact values should be stored locally or in your deployment provider's environment-variable settings.

Frontend example:

VITE_API_URL=http://localhost:5000

Backend configuration uses environment variables for values such as:

PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AUDIUS_API_KEY=your_audius_api_key

Additional email/password-reset configuration should also be stored as environment variables rather than committed to the repository.

💻 Local Development

1. Clone the repository

git clone <your-repository-url>
cd VerseHana

2. Install frontend dependencies

npm install

3. Install backend dependencies

cd backend
npm install
cd ..

4. Configure environment variables

Create the required environment files for the frontend and backend.

For the frontend:

VITE_API_URL=http://localhost:5000

For the backend, configure MongoDB, authentication, Audius, and any email-service credentials required by the application.

5. Start the backend

cd backend
npm run dev

The backend runs on the configured port, which defaults to:

http://localhost:5000

6. Start the frontend

Open another terminal:

npm run dev

Vite will provide the local development URL, normally:

http://localhost:5173

📦 Production Build

Build the frontend with:

npm run build

To preview the production build locally:

npm run preview

The backend can be started with:

cd backend
npm start

📸 Screenshots

Add project screenshots here to showcase the completed interface.

Recommended screenshots:

screenshots/
├── landing-page.png
├── discover.png
├── mood-selection.png
├── dashboard.png
└── admin-dashboard.png

Example README usage:

![VerseHana Landing Page](screenshots/landing-page.png)

Screenshots are especially useful for demonstrating the responsive design and the visual identity of VerseHana.

🎨 Design Philosophy

VerseHana uses a cinematic, premium, mood-driven visual style.

The interface focuses on:

Dark immersive backgrounds

Violet and fuchsia accents

Soft ambient gradients

Rounded music cards

Large expressive typography

Motion-based interactions

Responsive layouts

Emotion-focused content presentation

The goal is for the interface to feel closer to a music experience than a traditional CRUD application.

🧭 User Experience Flow

Landing Page
     │
     ├── Explore moods
     ├── Discover music
     ├── Browse artists
     └── Search
             │
             ▼
          Login / Signup
             │
             ▼
        User Dashboard
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
 Discover  Playlists  Profile
     │       │        │
     ├───────┼────────┤
     ▼       ▼        ▼
   Player   Likes   History
             │
             ▼
       Personalized
       music experience

🌱 Future Improvements

Potential future development areas include:

More advanced recommendation algorithms

Better personalization based on listening history

Expanded artist profiles

More playlist customization

Improved lyrics synchronization

More detailed music analytics

Native mobile application integration

More advanced admin analytics

Additional music providers

🎓 Academic Project

VerseHana was developed as an academic full-stack web project with the goal of demonstrating practical implementation of:

Frontend development

Backend API development

Database design

Authentication and authorization

REST API integration

External API integration

Responsive UI/UX design

State management

CRUD operations

Role-based access control

Deployment-ready application architecture

👨‍💻 Author

VerseHana

A full-stack music platform project focused on mood-based music discovery and a modern listening experience.

📄 License

This project was created for educational/project purposes.

Third-party services, APIs, music, images, icons, and other external assets remain subject to their respective licenses and terms of use.

<p align="center">
  Made with ❤️ for music lovers.
</p>
