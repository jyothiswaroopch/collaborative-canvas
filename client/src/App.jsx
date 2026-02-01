import React, { useState, useEffect } from 'react';
import Canvas from './Canvas';
import { socket } from './socket';

const generateColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

function App() {
  const [roomId, setRoomId] = useState('global-room');
  const [username, setUsername] = useState('User_' + Math.floor(Math.random() * 1000));
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(5);
  const [tool, setTool] = useState('brush');
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const userColor = generateColor();

    socket.emit('join_room', { roomId, username, color: userColor });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('user_list', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('connect');
      socket.off('user_list');
    }
  }, []);

  const handleUndo = () => {
    socket.emit('undo', { roomId });
  };

  return (
    <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        zIndex: 100
      }}>
        <div>
          <strong>Room:</strong> {roomId}
        </div>
        <div style={{ width: 1, backgroundColor: '#ccc', height: '20px' }}></div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setTool('brush')}
            style={{ fontWeight: tool === 'brush' ? 'bold' : 'normal' }}
          >Brush</button>
          <button
            onClick={() => setTool('eraser')}
            style={{ fontWeight: tool === 'eraser' ? 'bold' : 'normal' }}
          >Eraser</button>
        </div>

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={tool === 'eraser'}
        />

        <input
          type="range"
          min="1"
          max="20"
          value={width}
          onChange={(e) => setWidth(parseInt(e.target.value))}
        />
        <span>{width}px</span>

        <div style={{ width: 1, backgroundColor: '#ccc', height: '20px' }}></div>

        <button onClick={handleUndo}>UNDO</button>
        <button onClick={() => socket.emit('redo', { roomId })}>REDO</button>
      </div>

      <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'none', zIndex: 50, textAlign: 'right' }}>
        <p style={{ margin: 0, fontSize: '12px', color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </p>
        <div style={{ marginTop: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px', pointerEvents: 'auto' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>Online Users ({users.length})</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '12px' }}>
            {users.map(u => (
              <li key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', marginBottom: '2px' }}>
                <span>{u.username} {u.username === username ? '(You)' : ''}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: u.color }}></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Canvas
        color={color}
        width={width}
        tool={tool}
        username={username}
        roomId={roomId}
      />
    </div>
  );
}

export default App;
