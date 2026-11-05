# ARMAK MESSENGER

Starter project for a blue-and-white Persian (RTL) real-time messenger.

## Included
- `server.js` — Express + Socket.IO server
- `public/index.html` — mobile-friendly Persian chat UI
- `package.json` — dependencies and run scripts
- `.env.example` — optional port setting
- `.gitignore`

## Requirements
- Node.js 18 or newer
- Internet access during setup to install npm packages

## Run locally
1. Extract the ZIP.
2. Open a terminal in the extracted `armak-messenger-project` folder.
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open `http://localhost:3000` in your browser.

To test real-time chat, open the page in two browser tabs and choose different display names.

## Important limitations
This is a starter/demo, not a production-ready service:
- Messages and room history are held in server memory and disappear when the server restarts.
- Display names are not verified accounts; there is no real registration/password system.
- Do not use it for private or sensitive conversations.
- Before public deployment, add a database, proper authentication, rate limiting, input moderation, HTTPS, backups, privacy/terms pages, and abuse reporting.
- Never put private API keys or passwords in `public/index.html`.

## Deploying
Deploy the Node.js app to a host that supports persistent Node.js processes and WebSockets. A static-only host such as GitHub Pages cannot run `server.js`.
