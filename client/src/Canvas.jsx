import React, { useRef, useEffect, useState } from 'react';
import { socket } from './socket';

export default function Canvas({ color, width, tool, username, roomId }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const cursorsRef = useRef(new Map());
    const [cursors, setCursors] = useState({});

    const currentStrokeRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            socket.emit('join_room', { roomId, username });
        };

        window.addEventListener('resize', handleResize);

        socket.on('draw_point', (data) => {
            const { point, toolOptions } = data;
            drawPoint(point, toolOptions);
        });

        socket.on('history_sync', (history) => {
            redrawCanvas(history);
        });

        socket.on('history_update', (history) => {
            redrawCanvas(history);
        });

        socket.on('stroke_committed', (stroke) => {
        });

        socket.on('cursor_update', (data) => {
            const { userId, x, y, color, username } = data;
            cursorsRef.current.set(userId, { x, y, color, username });
            setCursors(prev => ({ ...prev, [userId]: { x, y, color, username } }));
        });

        socket.on('user_left', ({ userId }) => {
            cursorsRef.current.delete(userId);
            setCursors(prev => {
                const newCursors = { ...prev };
                delete newCursors[userId];
                return newCursors;
            });
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.off('draw_point');
            socket.off('history_sync');
            socket.off('history_update');
            socket.off('stroke_committed');
            socket.off('cursor_update');
            socket.off('user_left');
        };
    }, [roomId, username]);

    const redrawCanvas = (history) => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        history.forEach(stroke => {
            if (stroke.points.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
                ctx.lineWidth = stroke.width;
                ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
                for (let i = 1; i < stroke.points.length; i++) {
                    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
                }
                ctx.stroke();
            }
        });

        const currentPoints = currentStrokeRef.current;
        if (currentPoints.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineWidth = width;
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
            for (let i = 1; i < currentPoints.length; i++) {
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
            }
            ctx.stroke();
        }
    };

    const drawPoint = (point, options) => {
        const ctx = ctxRef.current;
        if (!options || !point.start || !point.end) return;

        ctx.beginPath();
        ctx.strokeStyle = options.tool === 'eraser' ? '#ffffff' : options.color;
        ctx.lineWidth = options.width;
        ctx.moveTo(point.start.x, point.start.y);
        ctx.lineTo(point.end.x, point.end.y);
        ctx.stroke();
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        currentStrokeRef.current = [{ x: offsetX, y: offsetY }];
    };

    const draw = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;

        socket.emit('cursor_move', { roomId, x: offsetX, y: offsetY, color, username });

        if (!isDrawing) return;

        const points = currentStrokeRef.current;
        const lastPoint = points.length > 0 ? points[points.length - 1] : null;
        const newPoint = { x: offsetX, y: offsetY };

        if (lastPoint) {
            const ctx = ctxRef.current;
            ctx.beginPath();
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineWidth = width;
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(newPoint.x, newPoint.y);
            ctx.stroke();

            socket.emit('draw_point', {
                roomId,
                point: { start: lastPoint, end: newPoint },
                toolOptions: { color, width, tool }
            });
        }

        points.push(newPoint);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const points = currentStrokeRef.current;

        if (points.length > 1) {
            socket.emit('stroke_end', {
                roomId,
                stroke: {
                    points,
                    color,
                    width,
                    tool
                }
            });
        }
        currentStrokeRef.current = [];
    };

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            {Object.values(cursors).map(cursor => (
                <div
                    key={cursor.username}
                    style={{
                        position: 'absolute',
                        left: cursor.x,
                        top: cursor.y,
                        pointerEvents: 'none',
                        zIndex: 10,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: cursor.color,
                        border: '1px solid white'
                    }} />
                    <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: cursor.color,
                        padding: '2px 4px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: 'white',
                        whiteSpace: 'nowrap'
                    }}>
                        {cursor.username}
                    </span>
                </div>
            ))}

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair', display: 'block' }}
            />
        </div>
    );
}
