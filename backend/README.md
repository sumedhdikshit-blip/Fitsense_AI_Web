# FitSense AI backend

This is the MERN backend for the existing React client. It uses Express, Mongoose/MongoDB, signed HTTP-only
session cookies, and bcrypt password hashes.

## Run

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long `SESSION_SECRET`.
2. Start MongoDB.
3. Run `npm install` and `npm run dev` from this directory.
4. Run the frontend with `npm run dev` from the repository root.

The previous Python backend's webcam/MediaPipe/WebSocket feature is intentionally not migrated. Workout sets are
entered manually through the existing workout UI.
