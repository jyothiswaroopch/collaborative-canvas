# Real-Time Collaborative Drawing Canvas

A real-time multi-user drawing application using the HTML5 Canvas API and WebSockets.

## Features
- **Real-time Drawing**: See other users draw as it happens.
- **Collaborative**: Multiple users on the same canvas.
- **Global Undo/Redo**: Undo actions affect the shared canvas state.
- **User Presence**: See cursors of other connected users.
- **Tools**: Brush, Eraser, Colors, Stroke Width.

## Prerequisites
- Node.js installed.

## Installation & Running

### 1. Start the Server
Navigate to the `server` directory:
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:3000
```
(You may need to configure the port in `.env` or defaults to 3000)

### 2. Start the Client
Navigate to the `client` directory:
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

## Testing with Multiple Users
1. Open the application in one browser window/tab.
2. Open the application in a second window/tab (or Incognito mode).
3. Draw in one window and watch it appear in the other.

## Known Issues
- Network latency may cause slight delays in cursor updates.
- High-frequency drawing events are throttled for performance.

## Time Spent
- Project Setup: ~1 hour
- Implementation: TBD
