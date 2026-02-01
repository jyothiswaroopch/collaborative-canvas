# Real-Time Collaborative Canvas 🎨

A full-stack drawing application that allows multiple users to draw on the same canvas simultaneously. Built to demonstrate proficiency with **WebSockets** and the **HTML5 Canvas API**.

**Key Features:**
*   🚀 **Real-Time Sync**: Instant drawing updates across all connected clients using Socket.io.
*   🔄 **Global Undo/Redo**: Shared history stack that handles multi-user actions seamlessly.
*   👥 **Live Presence**: See cursors and names of other users in real-time.
*   🎨 **Drawing Tools**: Brush, Eraser, Color Picker, and Adjustable Stroke Width.
*   🛡️ **Conflict Resolution**: "Last Write Wins" strategy for history synchronization.

## Tech Stack
*   **Frontend**: React, Vite
*   **Backend**: Node.js, Express, Socket.io
*   **Graphics**: Native HTML5 Canvas API (No external drawing libraries)

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

### 2. Start the Client
Navigate to the `client` directory:
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

## Testing with Multiple Users
1. Open the application in one browser window.
2. Open the application in a second window (or Incognito mode).
3. Draw in one window and match it appear instantly in the other.
4. Test **Global Undo/Redo** by drawing in both windows and clicking Undo/Redo to see synchronized state changes.

## Known Issues
- Network latency may cause slight delays in cursor updates (simulated or real).
- High-frequency drawing events are optimized, but very poor connections might see "jumpy" lines.

## Time Spent
- ~4 hours (Setup, Implementation, Refactoring, Documentation)
