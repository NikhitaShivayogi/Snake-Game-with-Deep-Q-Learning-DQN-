import React, { useEffect, useRef } from 'react';

export const GameCanvas = ({ gameState, gridSize = 20, showGameOverFace = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = gridSize;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If game over and should show face, draw that
    if (showGameOverFace) {
      drawGameOverFace(ctx, canvas);
      return;
    }

    // Draw grid
    ctx.strokeStyle = '#1e1e1e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gameState.width; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, gameState.height * cellSize);
      ctx.stroke();
    }
    for (let i = 0; i <= gameState.height; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(gameState.width * cellSize, i * cellSize);
      ctx.stroke();
    }

    // Draw snake with innovative design
    if (gameState.snake && gameState.snake.length > 0) {
      gameState.snake.forEach((segment, index) => {
        const x = segment[0] * cellSize;
        const y = segment[1] * cellSize;
        const padding = 2;

        if (index === 0) {
          // HEAD - Bright cyan with eyes and mouth
          ctx.fillStyle = '#00ffff';
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - padding, 0, Math.PI * 2);
          ctx.fill();

          // Head border - glowing effect
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Eyes
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(x + cellSize / 3, y + cellSize / 3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + (cellSize * 2) / 3, y + cellSize / 3, 3, 0, Math.PI * 2);
          ctx.fill();

          // Mouth
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI);
          ctx.stroke();
        } else if (index === gameState.snake.length - 1) {
          // TAIL - Different color (purple/magenta)
          ctx.fillStyle = '#ff00ff';
          ctx.fillRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);

          // Tail gradient effect
          ctx.strokeStyle = '#ff0088';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);
        } else if (index === 1) {
          // NECK - Transition color (light green)
          ctx.fillStyle = '#88ff00';
          ctx.fillRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);

          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);
        } else {
          // BODY - Green gradient effect
          const bodyColor = index % 2 === 0 ? '#00dd77' : '#00aa55';
          ctx.fillStyle = bodyColor;
          ctx.fillRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);

          // Body border
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);
        }
      });
    }

    // Draw food - Apple/Berry style
    if (gameState.food) {
      const [fx, fy] = gameState.food;
      const cx = fx * cellSize + cellSize / 2;
      const cy = fy * cellSize + cellSize / 2;
      
      // Main apple body
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize / 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Apple shine/highlight
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(cx - cellSize / 6, cy - cellSize / 6, cellSize / 6, 0, Math.PI * 2);
      ctx.fill();

      // Apple stem
      ctx.strokeStyle = '#00aa00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - cellSize / 2.5);
      ctx.lineTo(cx, cy - cellSize / 1.5);
      ctx.stroke();

      // Apple leaf
      ctx.fillStyle = '#00cc00';
      ctx.beginPath();
      ctx.ellipse(cx + cellSize / 4, cy - cellSize / 1.3, cellSize / 6, cellSize / 8, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [gameState, gridSize, showGameOverFace]);

  // Draw game over face
  const drawGameOverFace = (ctx, canvas) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headRadius = Math.min(canvas.width, canvas.height) / 4;

    // Main face - Red/Orange color for "dead"
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Face border - bright red
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Left eye - X shape
    const eyeLeftX = centerX - headRadius / 3;
    const eyeRightX = centerX + headRadius / 3;
    const eyeY = centerY - headRadius / 4;
    const eyeSize = headRadius / 6;

    // Left eye X
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(eyeLeftX - eyeSize, eyeY - eyeSize);
    ctx.lineTo(eyeLeftX + eyeSize, eyeY + eyeSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeLeftX + eyeSize, eyeY - eyeSize);
    ctx.lineTo(eyeLeftX - eyeSize, eyeY + eyeSize);
    ctx.stroke();

    // Right eye X
    ctx.beginPath();
    ctx.moveTo(eyeRightX - eyeSize, eyeY - eyeSize);
    ctx.lineTo(eyeRightX + eyeSize, eyeY + eyeSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(eyeRightX + eyeSize, eyeY - eyeSize);
    ctx.lineTo(eyeRightX - eyeSize, eyeY + eyeSize);
    ctx.stroke();

    // Sad mouth - upside down arc
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY + headRadius / 2, headRadius / 3, 0, Math.PI);
    ctx.stroke();

    // Tongue sticking out
    ctx.fillStyle = '#ff0066';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + headRadius * 0.8, headRadius / 8, headRadius / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tears
    ctx.fillStyle = '#6b9cff';
    const tearLeftX = eyeLeftX;
    const tearRightX = eyeRightX;
    
    // Left tear
    ctx.beginPath();
    ctx.arc(tearLeftX, eyeY + eyeSize + headRadius / 3, headRadius / 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Right tear
    ctx.beginPath();
    ctx.arc(tearRightX, eyeY + eyeSize + headRadius / 3, headRadius / 10, 0, Math.PI * 2);
    ctx.fill();
  };

  if (!gameState) {
    return <div className="spinner"><div className="loading"></div></div>;
  }

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={gameState.width * gridSize}
        height={gameState.height * gridSize}
        style={{ border: '2px solid #00ff88' }}
      />
    </div>
  );
};
