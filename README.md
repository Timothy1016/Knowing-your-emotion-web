# Box of Emotions

## Run locally

The default build is fully static and can be opened directly or published with GitHub Pages. Accounts, notes, favorites, and history are device-local. Local-account passwords use PBKDF2 hashes and never store plain text. Emotion analysis runs in JavaScript and does not contact a private server.

`app.py` remains an optional backend for future cross-device synchronization. It is disabled unless `window.BOX_USE_SERVER = true` is explicitly configured before `app.js` loads.

## PWA and offline use

GitHub Pages serves the app over HTTPS, allowing `service-worker.js` to cache the complete application shell. After one successful online visit, the 68-emotion library, local accounts, notes, favorites, history, search, and client-side emotion analysis work offline. Installation uses `manifest.webmanifest` and the icons under `icons/`. Service workers do not register from a `file://` URL.

The full English essays for all 68 emotions live in `full-essays.js`; `emotions.js` keeps the emotion structure, Indonesian and Mandarin versions, related links, and spectrum metadata.

## Production configuration

Copy `.env.example` into your hosting provider’s environment settings. Set `BOX_ENV=production`, use a persistent path for `BOX_DATABASE_PATH`, and restrict `ALLOWED_ORIGINS` to the real HTTPS frontend domain. Start the app using the included `Procfile`; debug mode is disabled by default.

User passwords are hashed with Werkzeug and sessions use opaque HttpOnly cookies. Notes, favorites, and history for registered users are stored in SQLite. Guest data remains local to the browser. The emotion classifier is educational and is not a medical diagnosis.

## Tests

- `python3 -m unittest discover -s tests -p 'test_*.py'`
- `node tests/test_frontend.mjs`
