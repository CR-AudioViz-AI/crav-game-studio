'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_HEIGHT = 80;
const PLAYER_SIZE = 50;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'rock' | 'bird';
}

interface Collectible {
  x: number;
  y: number;
  type: 'coin' | 'gem';
  collected: boolean;
}

interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export default function EndlessRunnerTemplate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE,
    playerVelY: 0,
    isJumping: false,
    isDucking: false,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    clouds: [] as Cloud[],
    groundOffset: 0,
    speed: 6,
    maxSpeed: 15,
    score: 0,
    coins: 0,
    distance: 0,
    isGameOver: false,
    lastObstacle: 0,
    frameCount: 0,
    runFrame: 0,
  });

  const startGame = useCallback(() => {
    const state = gameStateRef.current;
    state.playerY = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;
    state.playerVelY = 0;
    state.isJumping = false;
    state.isDucking = false;
    state.obstacles = [];
    state.collectibles = [];
    state.clouds = [
      { x: 100, y: 50, size: 40, speed: 0.5 },
      { x: 300, y: 80, size: 30, speed: 0.3 },
      { x: 500, y: 40, size: 50, speed: 0.4 },
      { x: 700, y: 70, size: 35, speed: 0.6 },
    ];
    state.groundOffset = 0;
    state.speed = 6;
    state.score = 0;
    state.coins = 0;
    state.distance = 0;
    state.isGameOver = false;
    state.lastObstacle = 0;
    state.frameCount = 0;

    setScore(0);
    setCoins(0);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const state = gameStateRef.current;

    const jump = () => {
      if (!state.isJumping && !state.isGameOver) {
        state.playerVelY = JUMP_FORCE;
        state.isJumping = true;
      }
    };

    const duck = (isDucking: boolean) => {
      state.isDucking = isDucking && !state.isJumping;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        jump();
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        duck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's') {
        duck(false);
      }
    };

    const handleTouch = () => {
      jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('click', handleTouch);

    const spawnObstacle = () => {
      const types: Array<'cactus' | 'rock' | 'bird'> = ['cactus', 'cactus', 'rock', 'bird'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let width: number, height: number, y: number;
      
      if (type === 'cactus') {
        width = 30 + Math.random() * 20;
        height = 50 + Math.random() * 30;
        y = CANVAS_HEIGHT - GROUND_HEIGHT - height;
      } else if (type === 'rock') {
        width = 40 + Math.random() * 20;
        height = 30 + Math.random() * 15;
        y = CANVAS_HEIGHT - GROUND_HEIGHT - height;
      } else {
        width = 40;
        height = 30;
        y = CANVAS_HEIGHT - GROUND_HEIGHT - 80 - Math.random() * 40;
      }

      state.obstacles.push({
        x: CANVAS_WIDTH + 50,
        y,
        width,
        height,
        type,
      });
    };

    const spawnCollectible = () => {
      if (Math.random() > 0.03) return;
      
      const type: 'coin' | 'gem' = Math.random() > 0.8 ? 'gem' : 'coin';
      const y = CANVAS_HEIGHT - GROUND_HEIGHT - 60 - Math.random() * 80;
      
      state.collectibles.push({
        x: CANVAS_WIDTH + 50,
        y,
        type,
        collected: false,
      });
    };

    const checkCollision = (obs: Obstacle): boolean => {
      const playerX = 100;
      const playerWidth = PLAYER_SIZE;
      const playerHeight = state.isDucking ? PLAYER_SIZE * 0.5 : PLAYER_SIZE;
      const playerY = state.isDucking 
        ? CANVAS_HEIGHT - GROUND_HEIGHT - playerHeight 
        : state.playerY;

      return (
        playerX < obs.x + obs.width &&
        playerX + playerWidth > obs.x &&
        playerY < obs.y + obs.height &&
        playerY + playerHeight > obs.y
      );
    };

    const gameLoop = () => {
      if (state.isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      state.frameCount++;

      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);

      // Sun
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(700, 60, 40, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      ctx.fillStyle = '#ffffff';
      state.clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) {
          cloud.x = CANVAS_WIDTH + cloud.size;
        }
        
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.1, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ground
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
      
      // Grass
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 15);

      // Ground pattern (moving)
      state.groundOffset = (state.groundOffset + state.speed) % 40;
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      for (let x = -state.groundOffset; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, CANVAS_HEIGHT - GROUND_HEIGHT + 15);
        ctx.lineTo(x + 20, CANVAS_HEIGHT - 30);
        ctx.stroke();
      }

      // Physics
      state.playerVelY += GRAVITY;
      state.playerY += state.playerVelY;

      const groundLevel = CANVAS_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE;
      if (state.playerY >= groundLevel) {
        state.playerY = groundLevel;
        state.playerVelY = 0;
        state.isJumping = false;
      }

      // Speed increase
      state.speed = Math.min(state.maxSpeed, 6 + state.distance / 2000);

      // Spawn obstacles
      state.lastObstacle++;
      const spawnRate = Math.max(50, 100 - Math.floor(state.distance / 500));
      if (state.lastObstacle >= spawnRate) {
        spawnObstacle();
        state.lastObstacle = 0;
      }

      // Spawn collectibles
      spawnCollectible();

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter(obs => {
        obs.x -= state.speed;

        // Draw obstacle
        if (obs.type === 'cactus') {
          ctx.fillStyle = '#228B22';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          // Spikes
          ctx.fillStyle = '#1a6b1a';
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * (i + 1) / 4, obs.y);
            ctx.lineTo(obs.x + obs.width * (i + 1) / 4 - 3, obs.y - 8);
            ctx.lineTo(obs.x + obs.width * (i + 1) / 4 + 3, obs.y - 8);
            ctx.fill();
          }
        } else if (obs.type === 'rock') {
          ctx.fillStyle = '#696969';
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#808080';
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
        } else {
          // Bird
          ctx.fillStyle = '#4a4a4a';
          const wingOffset = Math.sin(state.frameCount * 0.3) * 10;
          // Body
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 3, 0, 0, Math.PI * 2);
          ctx.fill();
          // Wings
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y + obs.height / 2);
          ctx.lineTo(obs.x, obs.y + wingOffset);
          ctx.lineTo(obs.x + obs.width / 4, obs.y + obs.height / 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y + obs.height / 2);
          ctx.lineTo(obs.x + obs.width, obs.y + wingOffset);
          ctx.lineTo(obs.x + obs.width * 0.75, obs.y + obs.height / 2);
          ctx.fill();
          // Beak
          ctx.fillStyle = '#FFA500';
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width, obs.y + obs.height / 2);
          ctx.lineTo(obs.x + obs.width + 10, obs.y + obs.height / 2);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height / 2 + 5);
          ctx.fill();
        }

        // Check collision
        if (checkCollision(obs)) {
          state.isGameOver = true;
          setGameOver(true);
          if (state.score > highScore) {
            setHighScore(state.score);
          }
        }

        return obs.x > -obs.width;
      });

      // Update and draw collectibles
      state.collectibles = state.collectibles.filter(col => {
        col.x -= state.speed;

        if (!col.collected) {
          // Draw collectible
          if (col.type === 'coin') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(col.x, col.y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#DAA520';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('$', col.x, col.y + 5);
          } else {
            ctx.fillStyle = '#00CED1';
            ctx.beginPath();
            ctx.moveTo(col.x, col.y - 12);
            ctx.lineTo(col.x + 10, col.y);
            ctx.lineTo(col.x, col.y + 12);
            ctx.lineTo(col.x - 10, col.y);
            ctx.closePath();
            ctx.fill();
          }

          // Check collection
          const playerX = 100;
          if (
            Math.abs(col.x - playerX - PLAYER_SIZE / 2) < 30 &&
            Math.abs(col.y - state.playerY - PLAYER_SIZE / 2) < 40
          ) {
            col.collected = true;
            state.coins += col.type === 'gem' ? 5 : 1;
            state.score += col.type === 'gem' ? 50 : 10;
            setCoins(state.coins);
          }
        }

        return col.x > -20;
      });

      // Draw player
      const playerX = 100;
      const playerHeight = state.isDucking ? PLAYER_SIZE * 0.5 : PLAYER_SIZE;
      const playerY = state.isDucking 
        ? CANVAS_HEIGHT - GROUND_HEIGHT - playerHeight 
        : state.playerY;

      // Running animation
      state.runFrame = (state.runFrame + 0.2) % 2;

      // Body
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(playerX, playerY, PLAYER_SIZE, playerHeight);

      // Face
      ctx.fillStyle = '#FFE4C4';
      ctx.fillRect(playerX + 10, playerY + 5, 30, 20);

      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(playerX + 20, playerY + 10, 4, 4);
      ctx.fillRect(playerX + 30, playerY + 10, 4, 4);

      // Legs (animated)
      if (!state.isJumping && !state.isDucking) {
        ctx.fillStyle = '#4169E1';
        const legOffset = Math.sin(state.frameCount * 0.5) * 8;
        ctx.fillRect(playerX + 10, playerY + playerHeight, 10, 10 + legOffset);
        ctx.fillRect(playerX + 30, playerY + playerHeight, 10, 10 - legOffset);
      }

      // Update score
      state.distance += state.speed;
      state.score = Math.floor(state.distance / 10) + state.coins * 10;
      setScore(state.score);

      // Draw HUD
      ctx.fillStyle = '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${state.score}`, 20, 40);
      ctx.fillText(`🪙 ${state.coins}`, 20, 70);

      ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(state.speed * 10)} km/h`, CANVAS_WIDTH - 20, 40);

      // Instructions
      if (state.distance < 500) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE / TAP to jump • DOWN to duck', CANVAS_WIDTH / 2, CANVAS_HEIGHT - GROUND_HEIGHT - 20);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('click', handleTouch);
    };
  }, [isPlaying, highScore]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/create/template"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Templates
          </Link>
          <div className="text-sm text-gray-400">Template: Endless Runner</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Game Info */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">🏃 Jungle Run</h1>
          <p className="text-gray-400">Jump over obstacles, collect coins, run forever!</p>
        </div>

        {/* Game Container */}
        <div className="flex justify-center mb-6">
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
            {!isPlaying ? (
              <div 
                className="flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-green-400"
                style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
              >
                <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">🏃 JUNGLE RUN</h2>
                <p className="text-xl text-white/90 mb-8">How far can you go?</p>
                
                <button
                  onClick={startGame}
                  className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <Play className="w-6 h-6" />
                  START RUNNING
                </button>

                <div className="mt-6 text-white/80 text-sm">
                  <p>SPACE / TAP - Jump</p>
                  <p>DOWN - Duck</p>
                </div>

                {highScore > 0 && (
                  <p className="mt-4 text-yellow-300 font-bold">High Score: {highScore}</p>
                )}
              </div>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="block cursor-pointer"
                />

                {gameOver && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-red-400 mb-4">GAME OVER!</h2>
                      <p className="text-2xl mb-2">Score: {score}</p>
                      <p className="text-lg text-yellow-400 mb-6">🪙 {coins} coins collected</p>
                      <button
                        onClick={startGame}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
                      >
                        Run Again
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        {isPlaying && (
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restart
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Obstacles Guide */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <div className="text-2xl mb-2">🌵</div>
            <div className="font-semibold text-green-400">Cactus</div>
            <div className="text-sm text-gray-400">Jump over it</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <div className="text-2xl mb-2">🪨</div>
            <div className="font-semibold text-gray-400">Rock</div>
            <div className="text-sm text-gray-400">Jump over it</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <div className="text-2xl mb-2">🦅</div>
            <div className="font-semibold text-blue-400">Bird</div>
            <div className="text-sm text-gray-400">Duck under it</div>
          </div>
        </div>

        {/* Customize CTA */}
        <div className="p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold mb-2">Make it yours!</h3>
          <p className="text-gray-400 mb-4">
            Change the character, add new obstacles, or create different environments with Javari AI.
          </p>
          <Link
            href="/create/chat?template=endless-runner"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
          >
            Customize with AI
          </Link>
        </div>
      </div>
    </div>
  );
}
