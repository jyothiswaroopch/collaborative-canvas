# Architecture - Collaborative Canvas

## Data Flow Diagram

1.  **User Action** (Mouse Down/Move/Up) -> **Canvas Event Listener**
2.  **Client Logic** -> Converts event to **Stroke Data**
3.  **WebSocket Client** -> Emits event (`draw_point`, `stroke_end`, `cursor_move`)
4.  **WebSocket Server** -> Receives event
    *   `draw_point`: Broadcasts to all *other* clients immediately (Real-time feedback).
    *   `stroke_end`: Adds stroke to **Global History**, broadcasts `stroke_committed`.
    *   `undo`: Removes last stroke from **Global History**, broadcasts `history_update`.
5.  **Other Clients** -> Receive event -> Update Canvas / Cursor.

## WebSocket Protocol

### Client -> Server
*   `join_room`: { roomId, username }
*   `draw_point`: { x, y, color, width, tool, ... } - Sent while drawing.
*   `stroke_end`: { points: [{x,y},...], color, width, tool } - Sent on mouse up to finalize stroke.
*   `undo`: {} - Request global undo.
*   `cursor_move`: { x, y }

### Server -> Client
*   `history_sync`: { history: [Stroke...] } - Sent on join.
*   `draw_point`: { x, y, color, width, tool, userId } - Broadcast to others.
*   `stroke_committed`: { strokeId, ... } - Confirmation/Update.
*   `history_update`: { history: [Stroke...] } - Sent after Undo/Redo to force sync.
*   `cursor_update`: { userId, x, y, color }
*   `user_list`: [ { userId, color }, ... ]

## Undo / Redo Strategy
*   **Global History**: The server maintains a linear stack of strokes.
*   **Undo**: Removes the top item from the stack.
*   **Redo**: (Optional extension) Could maintain a "Redo Stack", but for multi-user, usually only Undo is supported or Redo is complex (whose undo?). We will implement Global Undo.
*   **Synchronization**: When an undo happens, the simplest robust approach is to send the *entire* valid history (or a command to delete stroke ID X) to clients. Clients wipe the canvas and redraw the current history.

## Conflict Handling
*   **Concurrency**: Simple "Last Write Wins" for the history stack. If two users finish strokes at the same time, the server processes them sequentially.
*   **Visuals**: Real-time points are drawn immediately. If a conflict occurs (e.g. undo happens while someone is drawing), the `history_update` will authoritative reset the state.

## Performance Decisions
*   **Broadcasting**: We broadcast points for low-latency visual feedback, but store full strokes for robustness.
*   **Redraw**: Redrawing the whole canvas on Undo is acceptable for < 1000 strokes. For scaling, we would use off-screen canvases or spatial partitioning.
